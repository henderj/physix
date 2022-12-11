class Vector2 {
    static zero = new Vector2(0, 0);
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        Object.freeze(this);
    }
    static fromPolar(theta, magnitude) {
        return new Vector2(magnitude * Math.cos(theta), magnitude * Math.sin(theta));
    }
    static add(first, second) {
        return new Vector2(first.x + second.x, first.y + second.y);
    }
    static sub(first, second) {
        return new Vector2(first.x - second.x, first.y - second.y);
    }
    static scale(vec, factor) {
        return new Vector2(vec.x * factor, vec.y * factor);
    }
    get mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    get mag2() {
        return this.x ** 2 + this.y ** 2;
    }
    get normalized() {
        return new Vector2(this.x / this.mag, this.y / this.mag);
    }
}