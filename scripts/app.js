const WIDTH = 620;
const HEIGHT = 620;
const BALL_RADIUS = 25;
const BALL_COUNT = 20;
const INITIAL_VEL_MAG = 75;

const app = Vue.createApp({
    data() {
        return {
            count: 0,
            scene: new Scene(WIDTH, HEIGHT),
            ballCount: 20,
            maxMomentum: -1,
            minMomentum: -1
        }
    },
    methods: {
        doToggleSimulation(event) {
            this.scene.running = !this.scene.running;
        },
        doStep(event) {
            this.scene.step();
        },
        doUpdate(event) {
            this.scene.updateGameArea(event);
        },
        reset(event) {
            this.maxMomentum = -1;
            this.minMomentum = -1;
            this.scene.clearGameObjects();
            this.scene.running = false;
            const ctx = this.scene.context;
            for (var i = 0; i < this.ballCount; i++) {
                const x = Math.random() * (WIDTH - BALL_RADIUS * 2) + BALL_RADIUS;
                const y = Math.random() * (HEIGHT - BALL_RADIUS * 2) + BALL_RADIUS;
                const vtheta = Math.random() * 360;
                const vmag = Math.random() * INITIAL_VEL_MAG * 2 - INITIAL_VEL_MAG;

                const ball = new Ball(new Vector2(x, y), 1, "white", ctx);
                ball.rb.velocity = Vector2.fromPolar(vtheta, vmag);
                this.scene.addGameObject(ball);
            }
            this.scene.cacheCollisions();
        }
    },
    computed: {
        energy: function () {
            var sum = 0;
            this.scene.gameObjects.forEach(go => {
                sum += 0.5 * go.rb.mass * go.rb.velocity.mag2;
            });
            return sum;
        },
        momentum: function () {
            var sum = 0;
            this.scene.gameObjects.forEach(go => {
                sum += go.rb.mass * go.rb.velocity.mag;
            });
            if (sum > this.maxMomentum || this.maxMomentum == -1) this.maxMomentum = sum;
            if (sum < this.minMomentum || this.minMomentum <= 0) this.minMomentum = sum;
            return sum;
        },
        fps: function () {
            return this.scene.fps;
        }
    },
    mounted() {
        this.scene = new Scene(WIDTH, HEIGHT);
        this.scene.start();
        this.scene.timeScale = 5;
        this.reset();
        setInterval(() => this.scene.updateGameArea(), 0);
    }
});
app.mount('#app');