﻿class GameTime {
	static now(): number {
		return performance.now();
	}
}

class AnimatedElement {
	isRemoving: boolean;
	autoRotationDegeesPerSecond: number = 0;
	rotation: number;
	initialRotation: number;
	rotationStartTime: number;
	timeToRotate: number = 0;
	targetRotation: number = 0;
	degreesPerMs: number;
	lastRotationUpdate: number;
	opacity: number;
	expirationDate: number;
	timeStart: number;
	fadeInTime: number = 0;
	fadeOutTime: number = 4000;
	fadeOnDestroy: boolean = true;
	velocityX: number;
	velocityY: number;
	startX: number;
	startY: number;
	lastX: number;
	lastY: number;
	verticalThrustOverride: number = undefined;
	horizontalThrustOverride: number = undefined;

	constructor(public x: number, public y: number, lifeSpanMs: number = -1) {
		this.velocityX = 0;
		this.velocityY = 0;
		this.startX = x;
		this.startY = y;

		this.opacity = 1;
		this.rotation = 0;
		this.initialRotation = 0;

		this.timeStart = performance.now();

		if (lifeSpanMs > 0)
			this.expirationDate = this.timeStart + lifeSpanMs;
		else
			this.expirationDate = null;
	}

	render(context: CanvasRenderingContext2D, now: number) {
		// Do nothing. Allow descendants to override.
	}

	rotateTo(targetRotation: number, degreesToMove: number, timeToRotate: number): void {
		if (timeToRotate == 0)
			return;

		//if (this.timeToRotate > 0) {  // Already rotating...
		//  // TODO: Figure out what to do when we are already rotating.
		//  return;
		//}

		this.rotationStartTime = performance.now();
		this.timeToRotate = timeToRotate;
		this.targetRotation = targetRotation;
		this.lastRotationUpdate = this.rotationStartTime;
		this.degreesPerMs = degreesToMove / timeToRotate;
	}

	animate(nowMs: number) {
		if (nowMs < this.timeStart)
			return;

		if (this.timeToRotate > 0) {
			if (this.rotationStartTime + this.timeToRotate < nowMs) {
				// done rotating.
				this.timeToRotate = 0;
				this.rotation = this.targetRotation;
			}
			else {
				let timeSinceLastFrameAdvance: number = nowMs - this.lastRotationUpdate;
				let degreesToMove: number = this.degreesPerMs * timeSinceLastFrameAdvance;
				this.rotation += degreesToMove;
				if (this.rotation > 360) {
					this.rotation -= 360;
				}
				else if (this.rotation < 0) {
					this.rotation += 360;
				}
				this.lastRotationUpdate = nowMs;
			}
		}
		else if (this.autoRotationDegeesPerSecond != 0) {
			if (!this.rotationStartTime || this.rotationStartTime == 0)
				this.rotationStartTime = nowMs;
			else {
				let timeSpentRotatingSeconds: number = (nowMs - this.rotationStartTime) / 1000;
				this.rotation = this.initialRotation + timeSpentRotatingSeconds * this.autoRotationDegeesPerSecond;
			}
		}
	}

	getDistanceToXY(x: number, y: number): number {
		let deltaX: number = this.x - x;
		let deltaY: number = this.y - y;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}

	set delayStart(delayMs: number) {
		this.timeStart = performance.now() + delayMs;
	}

	destroyBy(lifeTimeMs: number): any {
		if (!this.expirationDate)
			this.expirationDate = performance.now() + Math.round(Math.random() * lifeTimeMs);
	}

	stillAlive(now: number, frameCount: number = 0): boolean {
		return this.getLifeRemaining(now) >= 0 || !this.okayToDie(frameCount);
	}

	getLifeRemaining(now: number) {
		let lifeRemaining: number = 0;
		if (this.expirationDate) {
			lifeRemaining = this.expirationDate - now;
		}
		return lifeRemaining;
	}

	okayToDie(frameCount: number): boolean {
		return true;
	}

	getAlpha(now: number): number {
		let msAlive: number = now - this.timeStart;

		if (msAlive < this.fadeInTime)
			return this.opacity * msAlive / this.fadeInTime;

		if (!this.expirationDate)
			return this.opacity;

		let lifeRemaining: number = this.expirationDate - now;
		if (lifeRemaining < this.fadeOutTime && this.fadeOnDestroy) {
			return this.opacity * lifeRemaining / this.fadeOutTime;
		}
		return this.opacity;
	}

	getHorizontalThrust(now: number): number {
		if (this.horizontalThrustOverride !== undefined)
			return this.horizontalThrustOverride;
		return 0;
	}

	getVerticalThrust(now: number): number {
		if (this.verticalThrustOverride !== undefined)
			return this.verticalThrustOverride;
		return gravityGames.activePlanet.gravity;
	}

	bounce(left: number, top: number, right: number, bottom: number, width: number, height: number, now: number) {
		var secondsPassed = (now - this.timeStart) / 1000;
		var horizontalBounceDecay = 0.9;
		var verticalBounceDecay = 0.9;

		var velocityX = Physics.getFinalVelocity(secondsPassed, this.velocityX, this.getHorizontalThrust(now));
		var velocityY = Physics.getFinalVelocity(secondsPassed, this.velocityY, this.getVerticalThrust(now));

		var hitLeftWall = velocityX < 0 && this.x < left;
		var hitRightWall = velocityX > 0 && this.x + width > right;

		var hitTopWall = velocityY < 0 && this.y < top;
		var hitBottomWall = velocityY > 0 && this.y + height > bottom;

		var newVelocityX = velocityX;
		var newVelocityY = velocityY;
		if (hitLeftWall || hitRightWall)
			newVelocityX = -velocityX * horizontalBounceDecay;
		if (hitTopWall || hitBottomWall)
			newVelocityY = -velocityY * verticalBounceDecay;

		if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
			this.x = this.startX + Physics.metersToPixels(Physics.getDisplacement(secondsPassed, this.velocityX, this.getHorizontalThrust(now)));
			this.y = this.startY + Physics.metersToPixels(Physics.getDisplacement(secondsPassed, this.velocityY, this.getVerticalThrust(now)));
			this.changeVelocity(newVelocityX, newVelocityY, now);
		}
		return hitBottomWall;
	}

	changingDirection(now: number): void {
		var secondsPassed = (now - this.timeStart) / 1000;
		var velocityX = Physics.getFinalVelocity(secondsPassed, this.velocityX, this.getHorizontalThrust(now));
		var velocityY = Physics.getFinalVelocity(secondsPassed, this.velocityY, this.getVerticalThrust(now));
		this.changeVelocity(velocityX, velocityY, now);
	}

	changeVelocity(velocityX: number, velocityY: number, now: number) {
		this.timeStart = now;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.startX = this.x;
		this.startY = this.y;
	}

	matches(matchData: any): boolean {
		return matchData === null;   // Descendants can override if they want to implement a custom search/find functionality...
	}

	storeLastPosition() {
		this.lastX = this.x;
		this.lastY = this.y;
	}

	updatePosition(now: number) {
		this.storeLastPosition();
		var secondsPassed = (now - this.timeStart) / 1000;

		var xDisplacement = Physics.getDisplacement(secondsPassed, this.velocityX, this.getHorizontalThrust(now));
		this.x = this.startX + Physics.metersToPixels(xDisplacement);

		var yDisplacement = Physics.getDisplacement(secondsPassed, this.velocityY, this.getVerticalThrust(now));
		this.y = this.startY + Physics.metersToPixels(yDisplacement);
	}

	setFadeTimes(fadeInTime: number, fadeOutTime: number): AnimatedElement {
		this.fadeInTime = fadeInTime;
		this.fadeOutTime = fadeOutTime;
		return this;
	}

	removing(): void {

	}

	destroying(): void {

	}
}

class SpriteProxy extends AnimatedElement {
	data: any;
	haveCycledOnce: boolean;
	flipHorizontally: boolean;
	flipVertically: boolean;
	systemDrawn: boolean = true;
	owned: boolean;
	cropped: boolean;
	playToEndOnExpire: boolean = false;
	frameIndex: number;
	cropTop: number;
	cropLeft: number;
	cropRight: number;
	cropBottom: number;
	numFramesDrawn: number = 0;
	scale: number = 1;
	lastTimeWeAdvancedTheFrame: number;

	constructor(startingFrameNumber: number, x: number, y: number, lifeSpanMs: number = -1) {
		super(x, y, lifeSpanMs);
		this.frameIndex = Math.floor(startingFrameNumber);
	}


	okayToDie(frameCount: number): boolean {
		return !this.playToEndOnExpire || this.frameIndex >= frameCount;
	}


	cycled(now: number) {
		this.haveCycledOnce = true;
	}


	advanceFrame(frameCount: number, nowMs: number, returnFrameIndex: number = 0, startIndex: number = 0, endBounds: number = 0, reverse: boolean = false, frameInterval: number = fps30, fileName: string = '') {
		if (nowMs < this.timeStart)
			return;

		let numFramesToAdvance: number;

		if (this.numFramesDrawn == 0) {
			numFramesToAdvance = 1;
			this.lastTimeWeAdvancedTheFrame = nowMs;
		}
		else {
			var msPassed = nowMs - this.lastTimeWeAdvancedTheFrame;
			if (msPassed < frameInterval)
				return;

			numFramesToAdvance = Math.floor(msPassed / frameInterval);
			if (numFramesToAdvance < 1)
				return;

			this.lastTimeWeAdvancedTheFrame += numFramesToAdvance * frameInterval;
		}

		this.numFramesDrawn += numFramesToAdvance;

		if (reverse) {
			this.frameIndex -= numFramesToAdvance;
		}
		else {
			this.frameIndex += numFramesToAdvance;
		}

		if (endBounds != 0) {
			if (this.frameIndex >= endBounds && (!this.expirationDate || this.getLifeRemaining(nowMs) > 0)) {
				this.frameIndex = startIndex;
				this.cycled(nowMs);
			}
		}
		else if (!reverse) {
			if (this.frameIndex >= frameCount) {
				this.frameIndex = returnFrameIndex;
				this.cycled(nowMs);
			}
		}
		else {
			if (this.frameIndex <= 0) {
				this.frameIndex = returnFrameIndex;
				this.cycled(nowMs);
			}
		}

	}

	getHalfWidth(): number {
		return 0;
	}

	getHalfHeight(): number {
		return 0;
	}

	isHitBy(thisSprite: SpriteProxy): boolean {
		const minDistanceForHit: number = 70;
		return this.getDistanceTo(thisSprite) < minDistanceForHit;
	}

	getDistanceTo(otherSprite: SpriteProxy): number {
		return this.getDistanceToXY(otherSprite.x, otherSprite.y);
	}

	pathVector(spriteWidth: number, spriteHeight: number): Line {
		let halfWidth: number = spriteWidth / 2;
		let halfHeight: number = spriteHeight / 2;
		return Line.fromCoordinates(this.lastX + halfWidth, this.lastY + halfHeight,
			this.x + halfWidth, this.y + halfHeight);
	}

	draw(baseAnimation: Part, context: CanvasRenderingContext2D, now: number, spriteWidth: number, spriteHeight: number,
		originX: number = 0, originY: number = 0): void {
		baseAnimation.drawByIndex(context, this.x, this.y, this.frameIndex, this.scale, this.rotation, this.x + originX, this.y + originY, this.flipHorizontally, this.flipVertically);
	}

	drawAdornments(context: CanvasRenderingContext2D, now: number): void {
		// Descendants can override if they want to draw on top of the sprite...
	}

	drawBackground(context: CanvasRenderingContext2D, now: number): void {
		// Descendants can override if they want to draw the background...
	}
}


class ColorShiftingSpriteProxy extends SpriteProxy {
	hueShift: number = 0;
	saturationPercent: number = 100;
	brightness: number = 100;
	hueShiftPerSecond: number = 0;

	constructor(startingFrameNumber: number, public center: Vector, lifeSpanMs: number = -1) {
		super(startingFrameNumber, center.x, center.y, lifeSpanMs);
	}

	draw(baseAnimation: Part, context: CanvasRenderingContext2D, now: number, spriteWidth: number, spriteHeight: number,
		originX: number = 0, originY: number = 0): void {
		let saveFilter: string = (context as any).filter;
		this.shiftColor(context, now);
		try {
			super.draw(baseAnimation, context, now, spriteWidth, spriteHeight, originX, originY);
		}
		finally {
			(context as any).filter = saveFilter;
		}
	}

	shiftColor(context: CanvasRenderingContext2D, now: number) {
		let hueShift: number = this.hueShift;
		if (this.hueShiftPerSecond != 0) {
			let secondsPassed: number = (now - this.timeStart) / 1000;
			hueShift = secondsPassed * this.hueShiftPerSecond % 360;
		}

		(context as any).filter = "hue-rotate(" + hueShift + "deg) grayscale(" + (100 - this.saturationPercent).toString() + "%) brightness(" + this.brightness + "%)";
	}

	setHueSatBrightness(hueShift: number, saturationPercent: number = -1, brightness: number = -1): ColorShiftingSpriteProxy {
		this.hueShift = hueShift;
		if (saturationPercent >= 0)
			this.saturationPercent = saturationPercent;
		if (brightness >= 0)
			this.brightness = brightness;
		return this;
	}
}