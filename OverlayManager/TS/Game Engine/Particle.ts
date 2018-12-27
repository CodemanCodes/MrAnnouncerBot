﻿class Particle {
  birthTime: number;
  displacement: Vector;

  constructor(public emitter: Emitter, now: number, public position: Vector, public velocity: Vector = Vector.fromPolar(0, 0), public radius: number = 1, public opacity: number = 1,
    public color: HueSatLight = HueSatLight.fromHex('f00')) {
    this.birthTime = now;
  }

  update(now: number, secondsSinceLastUpdate: number) {
    // TODO: Implement this...
    let relativeGravity = this.emitter.particleGravityCenter.subtract(this.position);
    let gravityX: number = relativeGravity.getXComponent(this.emitter.particleGravity);
    let gravityY: number = relativeGravity.getYComponent(this.emitter.particleGravity);

    let displacementX: number = Physics.getDisplacement(secondsSinceLastUpdate, this.velocity.x, gravityX);
    let displacementY: number = Physics.getDisplacement(secondsSinceLastUpdate, this.velocity.y, gravityY);

    this.position = new Vector(this.position.x + displacementX, this.position.y + displacementY);

    let newVelocityX: number = Physics.getFinalVelocity(secondsSinceLastUpdate, this.velocity.x, gravityX);
    let newVelocityY: number = Physics.getFinalVelocity(secondsSinceLastUpdate, this.velocity.y, gravityY);
    this.velocity = new Vector(newVelocityX, newVelocityY);
  }

  draw(context: CanvasRenderingContext2D, now: number) {
    if (this.hasExpired(now))
      return;

    if (now < this.birthTime)
      return;


    this.calculateOpacity(context, now);

    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, MathEx.TWO_PI);
    context.fillStyle = this.color.toHex();
    context.fill();

    context.globalAlpha = 1;
  }

  private calculateOpacity(context: CanvasRenderingContext2D, now: number) {
    let timeAliveMs: number = now - this.birthTime;
    let timeAliveSeconds: number = timeAliveMs / 1000;
    if (timeAliveSeconds < this.emitter.particleFadeInTime) {
      let percentageBorn: number = timeAliveSeconds / this.emitter.particleFadeInTime;
      context.globalAlpha = percentageBorn;
    }
    else {
      let lifeSpanSeconds: number = timeAliveMs / 1000;
      let percentageLived: number = lifeSpanSeconds / this.emitter.particleLifeSpanSeconds;
      context.globalAlpha = 1 - percentageLived;
    }
  }

  hasExpired(now: number): boolean {
    let lifeSpanSeconds: number = (now - this.birthTime) / 1000;
    return lifeSpanSeconds > this.emitter.particleLifeSpanSeconds;
  }
}
