/* jshint -W069, esversion:6 */

/**
 * Exploring JS book: http://exploringjs.com/es6/ch_classes.html
 */

/**
 * The operation of the program: “Add” button such that when it is clicked, 10 new boids are placed at random locations 
 * with random directions (remember, the velocity vectors must have unit magnitude); “Clear” button such that when it 
 * is clicked, all the boids are removed (this will be useful for starting over). The slider is for control the speed.
 */

// Set the size of the boids
const size = 5;
// Set the duration of the boids staying red after collision
const duration = 10;

class Boid {
    /**
     * 
     * @param {number} x    - initial X position
     * @param {number} y    - initial Y position
     * @param {number} vx   - initial X velocity
     * @param {number} vy   - initial Y velocity
     */
    constructor(x, y, vx = 1, vy = 0, mv = 1, s = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.s = s;
        this.mv = mv;
        this.normalize();
    }

    // Make sure the speed is 1 at all times
    normalize() {
        let norm = this.vx * this.vx + this.vy * this.vy;
        // If by accident, the norm is 0, normalize another random vector
        if (norm == 0) {
            this.vx = rand(-1, 1);
            this.vy = rand(-1, 1);
            this.normalize();
        }
        // Otherwise, divide the vector by its norm
        else if (norm != this.mv) {
            norm = Math.sqrt(norm);
            this.vx *= this.mv / norm;
            this.vy *= this.mv / norm;
        }
    }

    /**
     * Draw the Boid
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {

        context.save();
        // Set the color to red if the Boid is in a positive state
        if (this.s > 0) context.fillStyle = "red";
        else if (this.mv == 2) context.fillStyle = "green";
        this.s = Math.max(this.s - 1, 0);
        // Draw the triangle
        context.translate(this.x, this.y);
        context.rotate(Math.atan2(this.vy, this.vx));
        context.beginPath();
        context.moveTo(5, 0);
        context.lineTo(-5, 5);
        context.lineTo(-5, -5);
        context.closePath();
        context.fill();
        context.restore();
    }

    /**
     * Perform the "steering" behavior - This function should update the velocity based on the other
     * members of the flock. It is passed the entire flock (an array of Boids) - that includes "this"!
     * Note: dealing with the boundaries does not need to be handled here (in fact it can't be, since there is no awareness of the canvas)
     * *
     * And remember, (vx,vy) should always be a unit vector!
     * @param {Array<Boid>} flock 
     */
    steer(flock) {

        // Note - what a steering function might do all this one does is have things go in circles, rather than
        // straight lines Something this simple would not count for the bonus points:
        // a "real" steering behavior must consider other boids, or at least obstacles.

        // a simple steering behavior: 
        // create a rotation matrix that turns by a small amount
        // 2 degrees per time step

        const angle = 2 * Math.PI / 180;
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        let ovx = this.vx;
        let ovy = this.vy;

        this.vx = ovx * c + ovy * s;
        this.vy = -ovx * s + ovy * c;

    }
}

// Find a random number between 0 and 1
function rand(a = 0, b = 1) {
    return Math.random() * (b - a) + a;
}


window.onload = function () {
    /** @type Array<Boid> */
    let theBoids = [];

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("flock"));
    let context = canvas.getContext("2d");

    let speedSlider = /** @type {HTMLInputElement} */ (document.getElementById("speed"));

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the obstacles
        theObstacles.forEach(function (obstacle) {
            context.save();
            context.translate(obstacle.x, obstacle.y);
            context.fillStyle = "blue";
            if (obstacle.t == 0) {
                context.beginPath();
                context.arc(0, 0, obstacle.r, 0, 2 * Math.PI);
                context.fill();
            }
            else context.fillRect(- obstacle.r, - obstacle.r, obstacle.r * 2, obstacle.r * 2);
            context.restore();
        });

        theBoids.forEach(boid => boid.draw(context));
    }

    // (x, y) is the position, r is the size, and t = 0 if it is circle, and t = 1 if it is a square
    let theObstacles = [{ "x": 200, "y": 400, "r": 40, "t": 0 }, { "x": 150, "y": 150, "r": 40, "t": 1 }, { "x": 400, "y": 200, "r": 40, "t": 0 }];

    /**
     * Create some initial boids
     */
    theBoids.push(new Boid(100, 100));
    theBoids.push(new Boid(200, 200, -1, 0));
    theBoids.push(new Boid(300, 300, 0, -1));
    theBoids.push(new Boid(400, 400, 0, 1));

    /**
     * Handle the buttons
     */
    document.getElementById("add").onclick = function () {
        for (let i = 0; i < 10; i++) {
            let x = (Math.random() * 1000) % canvas.width;
            let y = (Math.random() * 1000) % canvas.height;
            let vx = (Math.random() < 0.5) ? -1 : 1;
            let vy = (Math.random() < 0.5) ? -1 : 1;
            theBoids.push(new Boid(x, y, vx, vy));
        }
    };
    document.getElementById("clear").onclick = function () {
        theBoids = [];
    };

    // Check if (x, y) is inside the obstacle
    function check_inside(x, y, obstacle) {
        if (obstacle.t == 0) return Math.sqrt((obstacle.x - x) * (obstacle.x - x) + (obstacle.y - y) * (obstacle.y - y)) <= obstacle.r + size;
        else return Math.abs(obstacle.x - x) < obstacle.r + size && Math.abs(obstacle.y - y) <= obstacle.r + size;
    }

    /**
     * The Actual Execution
     */
    function loop() {
        // change directions
        theBoids.forEach(boid => boid.steer(theBoids));
        // move forward
        let speed = Number(speedSlider.value);
        theBoids.forEach(function (boid) {
            boid.x += boid.vx * speed;
            boid.y += boid.vy * speed;
        });
        // make sure that we stay on the screen
        theBoids.forEach(function (boid) {
            //boid.x = boid.x % canvas.width;
            //boid.y = boid.y % canvas.height;
            //if (boid.x < 0) boid.x += canvas.width;
            //if (boid.y < 0) boid.y += canvas.height;
            // Change the direction if the boid hit the vertical boundaries of the canvas
            if (boid.s == 0 && (boid.x <= size && boid.vx < 0) || (boid.x >= canvas.width - size && boid.vx > 0)) {
                boid.vx = -boid.vx;
                boid.s = duration;
            }
            // Change the direction if the boid hit the horizontal boundaries of the canvas
            if (boid.s == 0 && (boid.y <= size && boid.vy < 0) || (boid.y >= canvas.height - size && boid.vy > 0)) {
                boid.vy = -boid.vy;
                boid.s = duration;
            }

            theObstacles.forEach(function (obstacle) {
                if (check_inside(boid.x, boid.y, obstacle)) {
                    // Change to the direction opposite to the center of the obstacle if it is a circle
                    if (obstacle.t == 0) {
                        boid.vy = boid.y - obstacle.y;
                        boid.vx = boid.x - obstacle.x;
                    }
                    // Change to the direction according to which edge the boid hits if it is a rectangle
                    else {
                        if (Math.abs(boid.y - obstacle.y) <= Math.abs(boid.x - obstacle.x)) boid.vx = Math.sign(boid.x - obstacle.x) * Math.abs(boid.vx);
                        else boid.vy = Math.sign(boid.y - obstacle.y) * Math.abs(boid.vy);
                    }
                    boid.normalize();
                    boid.s = duration;
                }
            });
        });
        // now we can draw
        draw();
        // and loop
        window.requestAnimationFrame(loop);
    }
    loop();
};