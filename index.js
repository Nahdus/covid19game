class HealthBar {
  constructor(scene, x, y) {
    this.bar = new Phaser.GameObjects.Graphics(scene);

    this.x = x;
    this.y = y;
    this.value = 100;
    this.p = 76 / 100;

    this.draw();

    scene.add.existing(this.bar);
  }
  getHealth() {
    return this.value;
  }

  decrease(amount) {
    this.value -= amount;

    if (this.value < 0) {
      this.value = 0;
    }

    this.draw();

    return this.value === 0;
  }
  increase(amount) {
    this.value += amount;

    if (this.value > 100) {
      this.value = 100;
    }

    this.draw();

    return this.value === 0;
  }

  draw() {
    this.bar.clear();

    //  BG
    this.bar.fillStyle(0x000000);
    this.bar.fillRect(this.x, this.y, 80, 16);

    //  Health

    this.bar.fillStyle(0xffffff);
    this.bar.fillRect(this.x + 2, this.y + 2, 76, 12);

    if (this.value < 30) {
      this.bar.fillStyle(0xff0000);
    } else {
      this.bar.fillStyle(0x00ff00);
    }

    var d = Math.floor(this.p * this.value);

    this.bar.fillRect(this.x + 2, this.y + 2, d, 12);
  }
}

var covid19 = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function covid19() {
    Phaser.Scene.call(this, { key: "covid19" });
    this.hero;
    this.layer;
  },

  preload: function () {
    this.load.image("briks", "assets/redAndMarble.png");
    this.load.image("virus", "assets/Red_Virus.png");
    this.load.spritesheet("hero", "assets/hero.png", {
      frameWidth: 22,
      frameHeight: 22,
    });
    this.load.spritesheet("foods", "assets/food.png", {
      frameWidth: 22,
      frameHeight: 22,
    });
    this.load.tilemapTiledJSON("map", "assets/world.json");
    this.load.image("spray", "assets/spray.png");
  },
  create: function () {
    this.keylock = false;
    this.walk = false;
    this.day = 0;
    this.dayText = this.renderText(this.day, { x: 100, y: 40 }, "green");
    this.gameOver = false;
    this.physics.world.setBoundsCollision(true, true, true, true);
    this.map = this.make.tilemap({ key: "map" });
    this.tiles = this.map.addTilesetImage("redAndMarble", "briks");
    this.layer = this.map.createDynamicLayer("walls", this.tiles, 0, 0); //.setVisible(false);
    this.doors = this.map.createDynamicLayer("doors", this.tiles, 0, 0);
    this.renderText("Hunger", { x: 500, y: 15 }, "red");
    this.renderText("Day", { x: 100, y: 15 }, "green");
    this.healthbar = new HealthBar(this, 500, 50);
    this.layer.setCollisionByExclusion([-1]);
    this.doors.setCollisionByExclusion([-1]);
    this.rt = this.add.renderTexture(0, 0, 800, 600);

    this.hero = this.physics.add
      .sprite(350, 500, "hero")
      .setCollideWorldBounds(true)
      .setBounce(1);

    this.hero.setScale(1.5);
    this.viruses = this.physics.add.group();
    this.viruses.create(44, 90, "virus");
    this.foods = this.physics.add.group();

    this.sprayParticles = this.add.particles("spray");
    
    console.log(this.sprayParticles);
    this.sprayParticlesangle = { min: -120, max: -60 };
    this.sprayParticlesEmmiterLocation = {
      x: this.hero.x,
      y: this.hero.y - 15,
    };
    console.log(this);
    this.foodLocations = [
      { x: 132, y: 242 },
      { x: 638, y: 286 },
      { x: 142, y: 638 },
      { x: 594, y: 638 },
    ];
    this.hungerTime = this.time.addEvent({
      delay: 5000, // ms
      callback: this.decreseHungerBar,
      //args: [],
      callbackScope: this,
      loop: true,
    });
    this.IncrementDay = this.time.addEvent({
      delay: 2000, // ms
      callback: this.increaseDay,
      //args: [],
      callbackScope: this,
      loop: true,
    });

    this.foodAdditionTime = this.time.addEvent({
      delay: 3000, // ms
      callback: this.addRandomFood,
      //args: [],
      callbackScope: this,
      loop: true,
    });

    this.increaseVirusTime = this.time.addEvent({
      delay: 3000, // ms
      callback: this.increaseVirus,
      //args: [],
      callbackScope: this,
      loop: true,
    });
    this.viruses.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      child.setVelocity(-75, -30).setCollideWorldBounds(true).setBounce(1);
      this.physics.add.collider(child, this.layer);
      this.physics.add.collider(child, this.doors);
      this.physics.add.overlap(
        this.hero,
        this.viruses,
        this.gameover,
        null,
        this
      );
     
    }, this);
    this.destroyVirus= {
        
      contains: function (x, y)

      {
        console.log(this )
          //     if(this.viruses.body.hitTest(x, y)){
                  
          //         console.log("virus hit")
                      
          //             //TEXT = that.add.text(190, 100, 'Rainbow Text', { font: "74px Arial Black", fill: "#fff" });
                  
          //     }
          
          // return this.viruses.body.hitTest(x, y)||platform.body.hitTest(x,y);
      }
  };
    this.physics.add.collider(this.hero, this.layer);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.spacebar = this.input.keyboard.addKey(32);
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("hero", { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "idle",
      frames: [{ key: "hero", frame: 0 }],
      frameRate: 50,
    });
  },
  renderText: function (Displaytext, position, color) {
    var style = {
      font: "bold 32px Arial",
      fill: "#fff",
      boundsAlignH: "center",
      boundsAlignV: "middle",
    };
    let text = this.add.text(0, 0, Displaytext, style);
    text.setShadow(3, 3, "rgba(0,0,0,0.5)", 2);
    text.setPosition(position.x, position.y);
    text.setColor(color);
    return text;
  },

  gameover: function () {
    this.physics.pause();
    this.renderText(
      "You are infected with covid 19",
      { x: 200, y: 259 },
      "red"
    );
    this.gameOver = true;
    this.increaseVirusTime.paused = true;
    this.hungerTime.paused = true;
    this.foodAdditionTime.paused = true;
    this.IncrementDay.paused = true;
  },
  increaseDay: function () {
    this.day += 1;
    this.dayText.setText(this.day);

    // this.dayText=this.renderText(this.day,{x:100,y:25},"green")
  },
  decreseHungerBar: function () {
    this.healthbar.decrease(10);
  },
  addRandomFood: function () {
    console.log("trying to add food");

    if (this.foods.children.size < 1) {
      let foodchoice = Phaser.Math.Between(0, 3);
      let randomlocation = this.foodLocations[Phaser.Math.Between(0, 3)];
      console.log(Phaser.Math.Between(0, 4));
      this.foods
        .create(randomlocation.x, randomlocation.y, "foods", foodchoice)
        .setScale(2);

      this.physics.add.overlap(
        this.hero,
        this.foods,
        this.consumeFood,
        null,
        this
      );
    }
  },
  consumeFood: function (hero, food) {
    console.log("eating");
    food.disableBody(true, true);
    food.destroy();
    this.increaseHungerBar();
  },
  increaseHungerBar: function () {
    this.healthbar.increase(20);
  },
  checkHungerDeath: function () {
    if (this.healthbar.getHealth() == 0) {
      this.physics.pause();
      this.renderText("You died of starvation", { x: 200, y: 259 }, "blue");
      this.gameOver = true;
      this.increaseVirusTime.paused = true;
      this.hungerTime.paused = true;
      this.foodAdditionTime.paused = true;
      this.IncrementDay.paused = true;
    }
  },

  increaseVirus: function () {
    // console.log('added virus')
    console.log(this.viruses);
    let virusPop = this.viruses.children.size;
    let randomVirus = this.viruses.children.entries[
      Phaser.Math.Between(0, virusPop - 1)
    ];

    let newVirus = this.viruses.create(
      randomVirus.x + 25,
      randomVirus.y + 25,
      "virus"
    );
    newVirus.setVelocity(-75, -30).setCollideWorldBounds(true).setBounce(1);
    this.physics.add.collider(newVirus, this.layer);
    this.physics.add.collider(newVirus, this.doors);
    this.physics.add.overlap(
      this.hero,
      this.viruses,
      this.gameover,
      null,
      this
    );
  },
  update: function (time, delta) {
    this.rt.draw(this.layer);
    if (this.keyA.isDown && this.keylock === false) {
      this.sprayParticlesEmmiterLocation.x = this.hero.x - 15;
      this.sprayParticlesEmmiterLocation.y = this.hero.y;
      this.sprayParticlesangle = { min: -210, max: -150 };
      this.keylock = true;
      this.hero.angle = -90;
      this.hero.setVelocityX(-160);
      this.hero.anims.play("walk", true);
    } else if (this.keyD.isDown && this.keylock === false) {
      this.sprayParticlesEmmiterLocation.x = this.hero.x + 15;
      this.sprayParticlesEmmiterLocation.y = this.hero.y;
      this.sprayParticlesangle = { min: -30, max: 30 };
      this.keylock = true;
      this.hero.angle = 90;
      this.hero.setVelocityX(160);
      this.hero.anims.play("walk", true);
    } else if (this.keyW.isDown && this.keylock === false) {
      this.sprayParticlesEmmiterLocation.x = this.hero.x;
      this.sprayParticlesEmmiterLocation.y = this.hero.y - 15;
      this.sprayParticlesangle = { min: -120, max: -60 };
      this.keylock = true;
      this.hero.angle = 0;
      this.hero.setVelocityY(-160);
      this.hero.anims.play("walk", true);
    } else if (this.keyS.isDown && this.keylock === false) {
      this.sprayParticlesEmmiterLocation.x = this.hero.x;
      this.sprayParticlesEmmiterLocation.y = this.hero.y + 15;
      this.sprayParticlesangle = { min: 60, max: 120 };
      this.keylock = true;
      this.hero.angle = 180;
      this.hero.setVelocityY(160);
      this.hero.anims.play("walk", true);
    } else if (this.spacebar.isDown) {
      console.log(this.sprayParticles);
      let emmiter = this.sprayParticles.createEmitter({
        alpha: { start: 1, end: 0 },
        scale: { start: 0.2, end: 0.5 },
        //tint: { start: 0xff945e, end: 0xff945e },
        speed: 100,

        
        
        angle: {
          min: this.sprayParticlesangle.min,
          max: this.sprayParticlesangle.max,
        },
        rotate: { min: -25, max: 25 },
        lifespan: { min: 1000, max: 1200 },
        blendMode: "ADD",
        frequency: 10,
        maxParticles: 5,
        x: this.sprayParticlesEmmiterLocation.x,
        y: this.sprayParticlesEmmiterLocation.y,
        deathZone: { type: 'onEnter', source: this.destroyVirus }
      });
      emmiter.enableBody=true
    } else {
      this.hero.setVelocityX(0);
      this.hero.setVelocityY(0);
      this.keylock = false;
    }
    if (this.keyA.isUp && this.keyS.isUp && this.keyD.isUp && this.keyW.isUp) {
      this.hero.anims.play("idle");
    }

    this.checkHungerDeath();
  },
});

let config = {
  type: Phaser.WEBGL,
  width: 792,
  height: 770,
  parent: "phaser-example",
  backgroundColor: "#808080",
  scene: [covid19],
  physics: {
    default: "arcade",
  },
};

var game = new Phaser.Game(config);
