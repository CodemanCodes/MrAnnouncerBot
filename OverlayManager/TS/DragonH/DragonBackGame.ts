﻿class DragonBackSounds extends SoundManager {
	constructor(soundPath: string) {
		super(soundPath);
	}
}

class DragonBackGame extends DragonGame {
	readonly clockMargin: number = 14;
	layerSuffix: string = 'Back';
	emitter: Emitter;
	scrollSlamlastUpdateTime: number;
	shouldDrawCenterCrossHairs: boolean = false;
	clock: Sprites;
	clockPanel: Sprites;
	lightning: Sprites;
	fireWall: Sprites;
	dndClock: SpriteProxy;
	dndClockPanel: SpriteProxy;
	dndTimeStr: string;
	characterStatsScroll: CharacterStatsScroll;
	dragonBackSounds: DragonBackSounds;
  

	constructor(context: CanvasRenderingContext2D) {
		super(context);
		this.dragonBackSounds = new DragonBackSounds('GameDev/Assets/DragonH/SoundEffects');
	}

	initializePlayerData(playerData: string): any {
		super.initializePlayerData(playerData);
		this.characterStatsScroll.initializePlayerData(this.players);
	}

	playerChanged(playerID: number, pageID: number, playerData: string): void {
		super.playerChanged(playerID, pageID, playerData);
		if (this.characterStatsScroll.playerDataChanged(playerID, pageID, playerData)) {
			if (pageID !== -1 && this.characterStatsScroll.activeCharacter) {
				this.dragonBackSounds.playRandom('Announcer/PlayerNames/' + this.characterStatsScroll.activeCharacter.firstName, 6);
			}
		}
	}

	changePlayerHealth(playerData: string): void {
		//this.characterStatsScroll.changePlayerHealth(playerData);
	}

	exitingCombat() {
		this.dndClock.frameIndex = 0;
		this.dndClockPanel.frameIndex = 0;
		this.fireWall.sprites = [];
		this.createFireBallBehindClock(200);
	}

	enteringCombat() {
		this.dndClock.frameIndex = 1;
		this.dndClockPanel.frameIndex = 1;
		this.createFireWallBehindClock();
		this.createFireBallBehindClock(330);
	}

	private getClockX(): number {
		return screenWidth - this.clockPanel.originX - this.clockMargin;
	}

	private drawTime(context: CanvasRenderingContext2D) {
		if (!this.dndTimeStr)
			return;

		const horizontalMargin: number = 10;
		const verticalMargin: number = 15;
		const textHeight: number = 28;
		context.font = textHeight + "px Baskerville Old Face";
		let boxWidth: number = context.measureText(this.dndTimeStr).width + 2 * horizontalMargin;
		let boxHeight: number = textHeight + 2 * verticalMargin;
		let centerX: number = screenWidth - this.clockPanel.originX - this.clockMargin;
		let centerY: number = screenHeight - textHeight / 2 - verticalMargin;
		//context.fillStyle = "#3b3581";
		//context.fillRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);
		if (this.inCombat)
			context.fillStyle = "#500506";
		else
			context.fillStyle = "#0b0650";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(this.dndTimeStr, centerX, centerY);
	}

	private createFireBallBehindClock(hue: number): any {
		let x: number;
		let y: number;
		x = this.getClockX() - 90;
		y = screenHeight - this.clockPanel.originY;
		let pos: Vector = new Vector(x - this.fireBallBack.originX, y - this.fireBallBack.originY);
		this.fireBallBack.sprites.push(new ColorShiftingSpriteProxy(0, pos).setHueSatBrightness(hue));
		this.fireBallFront.sprites.push(new ColorShiftingSpriteProxy(0, pos).setHueSatBrightness(hue));
		this.dragonBackSounds.safePlayMp3('HeavyPoof');
	}

	private createFireWallBehindClock() {
		const displayMargin: number = 16;
		let fireWall: SpriteProxy = this.fireWall.add(this.getClockX(), screenHeight - this.clockPanel.originY * 2 + displayMargin);
		fireWall.scale = 0.6;
		fireWall.opacity = 0.8;
		fireWall.fadeOutTime = 400;
		this.dragonBackSounds.safePlayMp3('FlameOn');
	}

	getDegreesToRotate(targetRotation: number, sprite: SpriteProxy): number {
		let degreesToMove: number = targetRotation - sprite.rotation;
		if (degreesToMove < 0) {
			degreesToMove += 360;
		}

		return degreesToMove;
	}

	updateClock(clockData: string): void {
		let dto: any = JSON.parse(clockData);
		this.inCombat = dto.InCombat;
		this.dndTimeStr = dto.Time;
		let fullSpins: number = dto.FullSpins;
		let afterSpinMp3: string = dto.AfterSpinMp3;

		let degreesToMove: number = this.getDegreesToRotate(dto.Rotation, this.dndClock);
		let timeToRotate: number;
		if (degreesToMove < 1) {
			if (fullSpins >= 1) {
				degreesToMove = 360;
				timeToRotate = 2600;
				this.dragonBackSounds.safePlayMp3('Gear2_6');
			}
			else
				timeToRotate = 250;
		}
		else if (degreesToMove < 10) {
			timeToRotate = 150;
			this.dragonBackSounds.safePlayMp3('Gear0_2');
		}
		else if (degreesToMove < 20) {
			timeToRotate = 250;
			this.dragonBackSounds.safePlayMp3('Gear0_25');
		}
		else if (degreesToMove < 45) {
			timeToRotate = 500;
			this.dragonBackSounds.safePlayMp3('Gear0_5');
		}
		else if (degreesToMove < 90) {
			timeToRotate = 1000;
			this.dragonBackSounds.safePlayMp3('Gear1_0');
		}
		else if (degreesToMove < 180) {
			timeToRotate = 1800;
			this.dragonBackSounds.safePlayMp3('Gear1_8');
		}
		else {
			timeToRotate = 2600;
			this.dragonBackSounds.safePlayMp3('Gear2_6');
		}

		if (afterSpinMp3) {
			this.dragonBackSounds.playMp3In(timeToRotate + 500, `TimeAmbiance/${afterSpinMp3}`);
		}

		this.dndClock.rotateTo(dto.Rotation, degreesToMove, timeToRotate);
	}

	update(timestamp: number) {
		this.updateGravity();
		super.update(timestamp);
	}

	updateScreen(context: CanvasRenderingContext2D, now: number) {
		super.updateScreen(context, now);

		this.drawTime(context);

		//backgroundBanner.draw(myContext, 0, 0);

		if (this.shouldDrawCenterCrossHairs)
			drawCrossHairs(myContext, screenCenterX, screenCenterY);
	}

	removeAllGameElements(now: number): void {
		super.removeAllGameElements(now);
	}

	playWindupSound(soundFileName: string): void {
		//this.dragonBackSounds.playRandom('Announcer/PlayerNames/' + this.characterStatsScroll.activeCharacter.firstName, 6);
		this.dragonBackSounds.safePlayMp3('Windups/' + soundFileName);
	}

	initialize() {
		super.initialize();

		Folders.assets = 'GameDev/Assets/DragonH/';

		this.lightning = new Sprites('PlayerEffects/Lightning/Lightning', 19, fps30, AnimationStyle.Sequential, true);
		this.lightning.name = 'Lightning';
		this.lightning.originX = 106;
		this.lightning.originY = 540;
		this.allWindupEffects.add(this.lightning);
		
		Folders.assets = 'GameDev/Assets/DroneGame/';

		//myRocket = new Rocket(0, 0);
		//myRocket.x = 0;
		//myRocket.y = 0;

		gravityGames = new GravityGames();

		this.initializeScroll();
	}

	initializeScroll(): any {
		this.characterStatsScroll = new CharacterStatsScroll();
		this.world.addCharacter(this.characterStatsScroll);

		//this.characterStatsScroll.characters.push(Character.newTestElf());
		//this.characterStatsScroll.characters.push(Character.newTestBarbarian());
		//this.characterStatsScroll.characters.push(Character.newTestWizard());
		//this.characterStatsScroll.characters.push(Character.newTestDruid());
		this.characterStatsScroll.pages.push(StatPage.createMainStatsPage());
		this.characterStatsScroll.pages.push(StatPage.createSkillsStatsPage());
		this.characterStatsScroll.pages.push(StatPage.createEquipmentPage());
		this.characterStatsScroll.selectedStatPageIndex = 0;

		this.characterStatsScroll.state = ScrollState.none;
	}

	start() {
		super.start();
		let saveLoadCopyrightedContent: boolean = loadCopyrightedContent;
		loadCopyrightedContent = false;
		try {
			gravityGames.selectPlanet('Earth');
		}
		finally {
			loadCopyrightedContent = saveLoadCopyrightedContent;
		}
		gravityGames.newGame();

		this.updateGravity();
		// If all characters were WorldObject descendants, this would be all that
		// is needed per game... just add the characters and let the world do the rest :)
		if (this.emitter)
			this.world.addCharacter(this.emitter);
	}

	loadDragonAssets() {
	}

	loadResources(): void {
		//this.blueBall();
		//this.purpleMagic();
		//this.purpleBurst();
		//this.orbital();
		//this.buildSmoke();
		//this.buildTestParticle();

		super.loadResources();

		this.characterStatsScroll.loadResources();

		//Folders.assets = 'GameDev/Assets/DroneGame/';
		this.loadDragonAssets();

		Folders.assets = 'GameDev/Assets/DragonH/';
		this.fireWall = new Sprites('FireWall/FireWall', 121, fps20, AnimationStyle.Loop, true);
		this.fireWall.name = 'FireWall';
		this.fireWall.originX = 300;
		this.fireWall.originY = 300;


		Part.loadSprites = true;

		//this.backgroundBanner = new Part("CodeRushedBanner", 1, AnimationStyle.Static, 200, 300);

		this.clockPanel = new Sprites('Clock/TimeDisplayPanel', 2, fps30, AnimationStyle.Static);
		this.clockPanel.name = 'ClockPanel';
		this.clockPanel.originX = 278;
		this.clockPanel.originY = 37;

		let clockX: number = this.getClockX();
		let clockY: number = screenHeight - 30;

		this.dndClockPanel = this.clockPanel.add(clockX, clockY);

		this.clock = new Sprites('Clock/SunMoonDial', 2, fps30, AnimationStyle.Static);
		this.clock.name = 'Clock';
		this.clock.originX = 247;
		this.clock.originY = 251;

		this.dndClock = this.clock.add(clockX, clockY);


		this.backLayerEffects.add(this.clock);
		this.backLayerEffects.add(this.fireWall);
		this.backLayerEffects.add(this.clockPanel);
	}

	buildTestGoldParticle(): any {
		//this.emitter = new Emitter(new Vector(1920, 1080), new Vector(-11, -14));
		let width: number = 37;
		let height: number = 69;
		this.emitter = new Emitter(new Vector(800, 460));
		this.emitter.setRectShape(width, height);
		this.emitter.saturation.target = 0.9;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.hue = new TargetValue(40, 0, 0, 60);
		//this.emitter.hue.binding = TargetBinding.rock;
		this.emitter.hue.absoluteVariance = 10;
		//this.emitter.hue.target = 240;
		//this.emitter.hue.drift = 0.6;
		this.emitter.brightness.target = 0.7;
		this.emitter.brightness.relativeVariance = 0.5;
		this.emitter.particlesPerSecond = 300;

		this.emitter.particleRadius.target = 1.5;
		this.emitter.particleRadius.relativeVariance = 0.3;

		this.emitter.particleLifeSpanSeconds = 1.7;
		this.emitter.particleGravity = 0;
		this.emitter.particleInitialVelocity.target = 0.2;
		this.emitter.particleInitialVelocity.relativeVariance = 0.5;
		this.emitter.particleMaxOpacity = 0.5;
		//this.emitter.airDensity = 0.2; // 0 == vaccuum.
		this.emitter.particleAirDensity = 0;  // 0 == vaccuum.
		//this.emitter.wind = new Vector(0, 0);
		//this.emitter.particleWind = new Vector(0, -3);
	}

	wind(): void {
		this.emitter = new Emitter(new Vector(1920 / 2, 1080 / 2));
		this.emitter.setRectShape(400, 1);
		this.emitter.saturation.target = 0.9;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.hue.absoluteVariance = 10;
		this.emitter.hue.target = 240;
		this.emitter.hue.drift = 0.6;
		this.emitter.brightness.target = 0.7;
		this.emitter.brightness.relativeVariance = 0.5;
		this.emitter.particlesPerSecond = 100;

		this.emitter.particleRadius.target = 2.5;
		this.emitter.particleRadius.relativeVariance = 0.8;

		this.emitter.particleLifeSpanSeconds = 12;
		this.emitter.particleGravity = -0.2;
		this.emitter.particleInitialVelocity.target = 0;
		this.emitter.particleInitialVelocity.relativeVariance = 0.5;
		this.emitter.gravity = 0;
		this.emitter.airDensity = 0; // 0 == vaccuum.
		this.emitter.particleAirDensity = 0.1;  // 0 == vaccuum.
		this.emitter.particleWind = new Vector(2, -0.1);
	}

	blood(): void {
		this.emitter = new Emitter(new Vector(450, 1080));
		this.emitter.radius = 1;
		this.emitter.saturation.target = 0.9;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.hue.absoluteVariance = 10;
		this.emitter.hue.target = 0;
		this.emitter.brightness.target = 0.4;
		this.emitter.brightness.relativeVariance = 0.3;
		this.emitter.particlesPerSecond = 1400;

		this.emitter.particleRadius.target = 2.5;
		this.emitter.particleRadius.relativeVariance = 0.8;

		this.emitter.particleLifeSpanSeconds = 2;
		this.emitter.particleGravity = 9.8;
		this.emitter.particleInitialVelocity.target = 0.8;
		this.emitter.particleInitialVelocity.relativeVariance = 0.25;
		this.emitter.gravity = 0;
		this.emitter.airDensity = 0; // 0 == vaccuum.
		this.emitter.particleAirDensity = 0.1;  // 0 == vaccuum.

		let sprayAngle: number = Random.intBetween(270 - 45, 270 + 45);
		let minVelocity: number = 9;
		let maxVelocity: number = 16;
		let angleAwayFromUp: number = Math.abs(sprayAngle - 270);
		if (angleAwayFromUp < 15)
			maxVelocity = 10;
		else if (angleAwayFromUp > 35)
			minVelocity = 13;
		else
			maxVelocity = 18;
		this.emitter.bonusParticleVelocityVector = Vector.fromPolar(sprayAngle, Random.intBetween(minVelocity, maxVelocity));

		this.emitter.renderOldestParticlesLast = true;
	}

	buildSmoke() {
		this.emitter = new Emitter(new Vector(screenCenterX + 90, screenCenterY + 160));
		this.emitter.radius = 66;
		this.emitter.saturation.target = 0;
		this.emitter.brightness.target = 0.8;
		this.emitter.brightness.relativeVariance = 0.1;
		this.emitter.particleRadius.target = 11;
		this.emitter.particleRadius.relativeVariance = 0.7;
		this.emitter.particlesPerSecond = 20;
		this.emitter.particleLifeSpanSeconds = 5;
		this.emitter.particleInitialVelocity.target = 0.15;
		this.emitter.particleGravity = -0.3;
		this.emitter.particleWind = Vector.fromPolar(270, 2);
	}

	orbital() {
		this.emitter = new Emitter(new Vector(1.1 * screenCenterX, screenCenterY), new Vector(0, -6));
		this.emitter.radius = 11;
		this.emitter.hue.target = 145;
		this.emitter.hue.absoluteVariance = 35;
		this.emitter.saturation.target = 0.8;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.brightness.target = 0.5;
		this.emitter.particleRadius.target = 2.2;
		this.emitter.particleRadius.relativeVariance = 0.8;
		this.emitter.particlesPerSecond = 800;
		this.emitter.particleLifeSpanSeconds = 1.5;
		this.emitter.particleInitialVelocity.target = 0.8;
		this.emitter.particleInitialVelocity.relativeVariance = 0.5;
		this.emitter.particleGravity = -5;
		this.emitter.particleMass = 0;
		this.emitter.particleFadeInTime = 0.05;
		this.emitter.airDensity = 0;
		this.emitter.gravity = 9;
		this.emitter.gravityCenter = new Vector(screenCenterX, screenCenterY);
	}

	purpleMagic() {
		this.emitter = new Emitter(new Vector(1920, 1200), new Vector(-6, -9));
		this.emitter.radius = 3;
		this.emitter.hue.target = 270;
		this.emitter.hue.absoluteVariance = 75;
		this.emitter.saturation.target = 0.8;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.brightness.target = 0.5;
		this.emitter.particleRadius.target = 1.2;
		this.emitter.particleRadius.relativeVariance = 0.8;
		this.emitter.particlesPerSecond = 800;
		this.emitter.particleLifeSpanSeconds = 1.5;
		this.emitter.particleInitialVelocity.target = 0.8;
		this.emitter.particleInitialVelocity.relativeVariance = 0.5;
		this.emitter.particleGravity = 4;
		this.emitter.particleFadeInTime = 0.05;
		this.emitter.gravity = 3;
	}

	edgeTest() {
		//this.emitter = new Emitter(new Vector(1046, 790));
		this.emitter = new Emitter(new Vector(1920 * 0.5, 1080 / 2));
		//this.emitter.radius = 160;
		this.emitter.setRectShape(300, 100);
		this.emitter.emitterEdgeSpread = 0;
		this.emitter.hue.target = 270;
		this.emitter.hue.absoluteVariance = 75;
		this.emitter.saturation.target = 0.8;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.brightness.target = 0.5;
		this.emitter.particleRadius.target = 1.2;
		this.emitter.particleRadius.relativeVariance = 0.8;
		this.emitter.particlesPerSecond = 2000;
		this.emitter.particleLifeSpanSeconds = 1.5;
		this.emitter.particleInitialVelocity.target = 0.8;
		this.emitter.particleInitialVelocity.relativeVariance = 0.5;
		this.emitter.particleGravity = 0;
		this.emitter.particleFadeInTime = 0.05;
		this.emitter.gravity = 0;
		this.emitter.particleMaxOpacity = 0.4;
	}

	purpleBurst() {
		this.emitter = new Emitter(new Vector(screenCenterX, screenCenterY));
		this.emitter.radius = 3;
		this.emitter.hue.target = 270;
		this.emitter.hue.absoluteVariance = 75;
		this.emitter.saturation.target = 0.8;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.brightness.target = 0.5;
		this.emitter.particleRadius.target = 2;
		this.emitter.particleRadius.relativeVariance = 0.8;
		this.emitter.particlesPerSecond = 600;
		this.emitter.particleLifeSpanSeconds = 2;
		this.emitter.particleInitialVelocity.target = 3.4;
		this.emitter.particleInitialVelocity.relativeVariance = 0.5;
		this.emitter.particleGravity = 0;
		this.emitter.particleFadeInTime = 0.1;
		this.emitter.gravity = 0;
		this.emitter.maxTotalParticles = 300;
	}

	blueBall() {
		this.emitter = new Emitter(new Vector(1250, 180));
		this.emitter.radius = 0;
		this.emitter.hue.target = 220;
		this.emitter.hue.absoluteVariance = 25;
		this.emitter.saturation.target = 0.8;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.brightness.target = 0.5;
		this.emitter.brightness.relativeVariance = 0.5;
		this.emitter.particleRadius.target = 4;
		this.emitter.particleRadius.relativeVariance = 3;
		this.emitter.particlesPerSecond = 200;
		this.emitter.particleLifeSpanSeconds = 24;
		this.emitter.particleInitialVelocity.target = 1.3;
		this.emitter.particleInitialVelocity.relativeVariance = 0.3;
		this.emitter.particleGravityCenter = new Vector(screenCenterX, screenCenterY);
		this.emitter.particleGravity = 3;
		this.emitter.airDensity = 0; // 0 == vaccuum.
		this.emitter.particleAirDensity = 0;  // 0 == vaccuum.
	}

	solo() {
		this.emitter = new Emitter(new Vector(screenCenterX, screenCenterY));
		this.emitter.radius = 0;
		this.emitter.hue.target = 0;
		this.emitter.hue.absoluteVariance = 25;
		this.emitter.saturation.target = 0.8;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.brightness.target = 0.5;
		this.emitter.brightness.relativeVariance = 0.5;
		this.emitter.particleRadius.target = 4;
		this.emitter.particlesPerSecond = 1;
		this.emitter.particleLifeSpanSeconds = 1;
		this.emitter.particleInitialVelocity.target = 10;
		this.emitter.particleGravityCenter = new Vector(screenCenterX, screenCenterY);
		this.emitter.particleGravity = 20;
	}

	rainbow() {
		this.emitter = new Emitter(new Vector(2000, 1350), new Vector(-10, -18));
		this.emitter.radius = 20;
		this.emitter.hue.absoluteVariance = 10;
		this.emitter.hue.target = 240;
		this.emitter.hue.drift = 0.06;
		this.emitter.saturation.target = 0.8;
		this.emitter.saturation.relativeVariance = 0.2;
		this.emitter.brightness.target = 0.5;
		this.emitter.brightness.relativeVariance = 0.5;
		this.emitter.particleRadius.target = 3;
		this.emitter.particleRadius.relativeVariance = 0.3;
		this.emitter.particlesPerSecond = 600;
		this.emitter.particleLifeSpanSeconds = 4.5;
		this.emitter.particleInitialVelocity.target = 0.5;
		//this.emitter.particleGravityCenter = new Vector(screenCenterX, screenCenterY);
		this.emitter.gravity = 3;
		this.emitter.particleGravity = 2;
		this.emitter.particleAirDensity = 0.1;  // 0 == vaccuum.
		this.emitter.particleWind = new Vector(2, -0.1);
	}

	executeCommand(command: string, params: string, userInfo: UserInfo, now: number): boolean {
		if (super.executeCommand(command, params, userInfo, now))
			return true;
		//if (command === "Launch") {
		//  if (!myRocket.started || myRocket.isDocked) {
		//    myRocket.started = true;
		//    myRocket.launch(now);
		//    gravityGames.newGame();
		//    chat('Launching...');
		//  }
		//}
		//else if (command === "Dock") {
		//  if (this.isSuperUser(userName)) {
		//    this.removeAllGameElements(now);
		//  }

		//  if (myRocket.started && !myRocket.isDocked) {
		//    chat('docking...');
		//    myRocket.dock(now);
		//  }
		//}
		//else if (command === "ChangePlanet") {
		//  gravityGames.selectPlanet(params);
		//}
		//else if (command === "Left") {
		//  myRocket.fireRightThruster(now, params);
		//}
		//else if (command === "Right") {
		//  myRocket.fireLeftThruster(now, params);
		//}
		//else if (command === "Up") {
		//  myRocket.fireMainThrusters(now, params);
		//}
		//else if (command === "Down") {
		//  myRocket.killHoverThrusters(now, params);
		//}
		//else if (command === "Drop") {
		//  myRocket.dropMeteor(now);
		//}
		//else if (command === "Cross") {
		//  this.shouldDrawCenterCrossHairs = !this.shouldDrawCenterCrossHairs;
		//}
		//else if (command === "Chutes") {
		//  if (myRocket.chuteDeployed)
		//    myRocket.retractChutes(now);
		//  else
		//    myRocket.deployChute(now);
		//}
		//else if (command === "Retract") {
		//  myRocket.retractEngines(now);
		//}
		//else if (command === "Extend") {
		//  myRocket.extendEngines(now);
		//}
		//else if (command === "Seed") {
		//  myRocket.dropSeed(now, params);
		//}
	}

	test(testCommand: string, userInfo: UserInfo, now: number): boolean {
		if (super.test(testCommand, userInfo, now))
			return true;

		if (testCommand === 'scroll') {
			this.characterStatsScroll.clear();
			this.initializeScroll();
			this.characterStatsScroll.open(this.now);
			return true;
		}

		if (testCommand === 'close') {
			this.characterStatsScroll.close();
			return true;
		}

		if (testCommand === 'Emphasis1') {
			this.characterStatsScroll.page = ScrollPage.main;
			this.characterStatsScroll.addEmphasis(emphasisMain.Strength);
			return true;
		}

		if (testCommand === 'Emphasis2') {
			this.characterStatsScroll.page = ScrollPage.main;
			this.characterStatsScroll.addEmphasis(emphasisMain.HitPoints);
			return true;
		}

		if (testCommand === 'Emphasis3') {
			this.characterStatsScroll.page = ScrollPage.skills;
			this.characterStatsScroll.addEmphasis(emphasisSkills.SkillsAnimalHandling);
			return true;
		}

		if (testCommand === '2') {
			this.characterStatsScroll.state = ScrollState.none;
			this.characterStatsScroll.setActiveCharacter(2);
			this.characterStatsScroll.open(this.now);
			return true;
		}

		if (testCommand === '1') {
			this.characterStatsScroll.state = ScrollState.none;
			this.characterStatsScroll.setActiveCharacter(1);
			this.characterStatsScroll.open(this.now);
			return true;
		}

		if (testCommand === '0') {
			this.characterStatsScroll.state = ScrollState.none;
			this.characterStatsScroll.setActiveCharacter(0);
			this.characterStatsScroll.open(this.now);
			return true;
		}

		if (testCommand === 'open') {
			this.characterStatsScroll.open(this.now);
			return true;
		}

		if (testCommand === 'page1') {
			this.characterStatsScroll.page = ScrollPage.main;
			return true;
		}

		if (testCommand === 'page2') {
			this.characterStatsScroll.page = ScrollPage.skills;
			return true;
		}

		if (testCommand === 'smoke') {
			this.world.removeCharacter(this.emitter);
			this.buildSmoke();
			this.world.addCharacter(this.emitter);
			return true;
		}

		if (testCommand === 'orbit') {
			this.world.removeCharacter(this.emitter);
			this.orbital();
			this.world.addCharacter(this.emitter);
			return true;
		}

		if (testCommand === 'edge') {
			this.world.removeCharacter(this.emitter);
			this.edgeTest();
			this.world.addCharacter(this.emitter);
			return true;
		}

		if (testCommand === 'wind') {
			this.world.removeCharacter(this.emitter);
			this.wind();
			this.world.addCharacter(this.emitter);
			return true;
		}

		//if (testCommand === 'blood') {
		//  this.world.removeCharacter(this.emitter);
		//  this.blood();
		//  this.world.addCharacter(this.emitter);
		//  return true;
		//}

		if (testCommand === 'gold') {
			this.world.removeCharacter(this.emitter);
			this.buildTestGoldParticle();
			this.world.addCharacter(this.emitter);
			return true;
		}

		if (testCommand === 'solo') {
			this.world.removeCharacter(this.emitter);
			this.solo();
			this.world.addCharacter(this.emitter);
			return true;
		}
		if (testCommand === 'rainbow') {
			this.world.removeCharacter(this.emitter);
			this.rainbow();
			this.world.addCharacter(this.emitter);
			return true;
		}

		if (testCommand === 'purpleMagic') {
			this.world.removeCharacter(this.emitter);
			this.purpleMagic();
			this.world.addCharacter(this.emitter);
			return true;
		}

		if (testCommand === 'purpleBurst') {
			this.world.removeCharacter(this.emitter);
			this.purpleBurst();
			this.world.addCharacter(this.emitter);
			return true;
		}

		if (testCommand === 'blueBall') {
			this.world.removeCharacter(this.emitter);
			this.blueBall();
			this.world.addCharacter(this.emitter);
			return true;
		}

		return false;
	}


} 