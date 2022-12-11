class Ball {
    static _ID = 100;
    static nextID() {
        this._ID++;
        return this._ID;
    }
    constructor(pos, mass, color, context) {
        this.size = BALL_RADIUS;
        this.color = color;
        this.context = context;
        this.transform = new Transform(pos, this);
        this.rb = new Rigidbody(mass, this);
        this.collider = new Collider(this.size, this);
        this.id = Ball.nextID();
    }
    tick(scene) {
        this.rb.tick(scene.timeDelta);
    }
    draw(showVelocity) {
        // ball
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(this.rb.pos.x, this.rb.pos.y, this.size, 0, 2 * Math.PI);
        this.context.fill();

        // velocity
        if (!showVelocity) return;
        this.context.strokeStyle = "red";
        this.context.beginPath();
        this.context.moveTo(this.transform.pos.x, this.transform.pos.y);
        this.context.lineTo(this.transform.pos.x + this.rb.velocity.x, this.transform.pos.y + this.rb.velocity.y);
        this.context.stroke();
    }
}

class Component {
    constructor(ball) {
        this.ball = ball;
    }
    get pos() {
        return this.ball.transform._pos;
    }
    set pos(newPos) {
        this.ball.transform._pos = newPos;
    }
}

class Transform extends Component {
    constructor(pos, ball) {
        super(ball);
        this._pos = pos;
    }
}

class Collider extends Component {
    constructor(radius, ball) {
        super(ball);
        this.radius = radius;
    }
    checkCollision(other) {
        var dif = Vector2.sub(this.pos, other.pos);
        return dif.mag2 <= (this.radius + other.radius) ** 2;
    }
}

class Rigidbody extends Component {
    static accFromGravity = 10;
    constructor(mass, ball) {
        super(ball);
        this.mass = mass;
        this.velocity = new Vector2();
        this.acceleration = new Vector2();
        this.netForce = new Vector2();
    }
    checkScreenCollisions() {
        var x = this.velocity.x, y = this.velocity.y;
        var px = this.pos.x, py = this.pos.y;
        if ((this.pos.x - this.ball.size < 0) || (this.pos.x + this.ball.size >= WIDTH)) {
            x *= -1;
            px = this.pos.x - this.ball.size < 0 ? this.ball.size : WIDTH - this.ball.size;
        }
        if ((this.pos.y - this.ball.size < 0) || (this.pos.y + this.ball.size >= HEIGHT)) {
            y *= -1;
            py = this.pos.y - this.ball.size < 0 ? this.ball.size : HEIGHT - this.ball.size;
        }
        this.velocity = new Vector2(x, y);
        this.pos = new Vector2(px, py);
    }
    doGravity() {
        this.addForce(new Vector2(0, Rigidbody.accFromGravity));
    }
    addForce(force) {
        this.netForce = Vector2.add(this.netForce, force);
    }
    tick(timeDelta) {
        this.checkScreenCollisions();
        // this.doGravity();
        this.acceleration = Vector2.add(this.acceleration, this.netForce);
        this.velocity = Vector2.add(this.velocity, this.acceleration);
        this.pos = Vector2.add(this.pos, Vector2.scale(this.velocity, timeDelta));

        this.netForce = Vector2.zero;
        this.acceleration = Vector2.zero;
    }
}
