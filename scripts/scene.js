const UPDATE_RATE = 1000 / 60;

class CollisionEngine {
    constructor(balls) {
        this.collisions = [];
        balls.forEach(ball => {
            balls.forEach(ball2 => {
                if (ball == ball2) return;
                var collision = { first: ball, second: ball2 };
                for (var i = 0; i < this.collisions.length; i++) {
                    var col = this.collisions[i];
                    if ((col.first.id == ball.id && col.second.id == ball2.id) ||
                        (col.first.id == ball2.id && col.second.id == ball.id)) {
                        return; // duplicate collision
                    }
                }
                this.collisions.push(collision);
            })
        })
    }
    checkAndDoCollisions() {
        this.collisions.forEach(col => {
            const first = col.first, second = col.second;
            if (!first.collider.checkCollision(second.collider)) return;

            var normal = Vector2.sub(second.rb.pos, first.rb.pos);
            const normalMag = normal.mag;
            normal = normal.normalized;

            if (normalMag < first.collider.radius + second.collider.radius) {
                const correctionMag = first.collider.radius - normalMag / 2;
                const firstCorrection = Vector2.scale(normal, -correctionMag);
                const secondCorrection = Vector2.scale(normal, correctionMag);

                first.rb.pos = Vector2.add(first.rb.pos, firstCorrection);
                second.rb.pos = Vector2.add(second.rb.pos, secondCorrection);
            }

            const p = 2 * (first.rb.velocity.x * normal.x + first.rb.velocity.y * normal.y
                - second.rb.velocity.x * normal.x - second.rb.velocity.y * normal.y)
                / (first.rb.mass + second.rb.mass);

            const vfinalx = first.rb.velocity.x - p * first.rb.mass * normal.x;
            const vfinaly = first.rb.velocity.y - p * first.rb.mass * normal.y;
            const vfinalx2 = second.rb.velocity.x + p * second.rb.mass * normal.x;
            const vfinaly2 = second.rb.velocity.y + p * second.rb.mass * normal.y;

            first.rb.velocity = new Vector2(vfinalx, vfinaly);
            second.rb.velocity = new Vector2(vfinalx2, vfinaly2);
        })
    }
}

class Scene {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.gameObjects = [];
        this.running = false;

        this.lastTimeStamp = Date.now();
        this.elapsedTime = 0;
        this.fps = 0;
        this.accumulatedTime = 0;
        this.accumulatedFrames = 0;
        this.timeScale = 1;
        this.stepOnce = false;

        this.showVelocity = false;
    }
    start() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    }
    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }
    clearGameObjects() {
        this.gameObjects = [];
    }
    cacheCollisions() {
        this.collisionEngine = new CollisionEngine(this.gameObjects);
    }
    clear() {
        this.context.fillStyle = 'darkgray';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    step() {
        this.running = false;
        this.stepOnce = true;
    }
    updateGameArea() {
        var now = Date.now();
        this.unscaledTimeDelta = now - this.lastTimeStamp;
        this.timeDelta = this.unscaledTimeDelta * this.timeScale * 0.001;
        this.lastTimeStamp = now;

        this.accumulatedTime += this.unscaledTimeDelta;
        this.accumulatedFrames++;
        this.elapsedTime += this.unscaledTimeDelta;

        if (this.accumulatedTime >= 1000) {
            this.fps = this.accumulatedFrames;
            this.accumulatedFrames = 0;
            this.accumulatedTime -= 1000;
        }

        while (this.elapsedTime >= UPDATE_RATE) {
            if (this.running || this.stepOnce) {
                this.collisionEngine.checkAndDoCollisions();
                this.gameObjects.forEach(go => go.tick(this));
                this.stepOnce = false;
            }
            this.elapsedTime -= UPDATE_RATE;
        }

        this.clear();
        this.gameObjects.forEach(go => go.draw(this.showVelocity));
    }
}
