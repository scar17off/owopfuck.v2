import { bots } from "./sharedState.js";
import config from "./config.js";

let animationInterval = null;
let angle = 0;
let progress = 0;

function moveBotsInCircle(centerX, centerY, length) {
    const radius = Math.max((length) * 2, 5);
    bots.forEach((bot, index) => {
        const botAngle = angle + (index * (2 * Math.PI / (length)));
        const x = Math.round(centerX + radius * Math.cos(botAngle));
        const y = Math.round(centerY + radius * Math.sin(botAngle));
        bot.world.move(x, y);
    });
    angle += 0.1;
    if (angle > 2 * Math.PI) {
        angle -= 2 * Math.PI;
    }
}

function moveBotsInSquare(centerX, centerY, size = 20, length) {
    const halfSize = Math.floor(size / 2);
    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    filteredBots.forEach((bot, index) => {
        const botProgress = (progress + index / length) % 1;
        let x, y;
        if (botProgress < 0.25) {
            x = centerX - halfSize + size * (botProgress * 4);
            y = centerY - halfSize;
        } else if (botProgress < 0.5) {
            x = centerX + halfSize;
            y = centerY - halfSize + size * ((botProgress - 0.25) * 4);
        } else if (botProgress < 0.75) {
            x = centerX + halfSize - size * ((botProgress - 0.5) * 4);
            y = centerY + halfSize;
        } else {
            x = centerX - halfSize;
            y = centerY + halfSize - size * ((botProgress - 0.75) * 4);
        }
        bot.world.move(Math.round(x), Math.round(y));
    });
    progress += 0.01;
    if (progress >= 1) {
        progress -= 1;
    }
}

function moveBotsInStar(centerX, centerY, length) {
    const starSizeMultiplier = 2;
    const lineLength = Math.max((length) * 2, 15) * starSizeMultiplier;
    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    const numPoints = 5;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const angleOffset = (2 * Math.PI / numPoints) * i + Math.PI / 2;
        points.push({
            x: centerX + Math.cos(angleOffset) * lineLength / 2,
            y: centerY + Math.sin(angleOffset) * lineLength / 2
        });
    }
    filteredBots.forEach((bot, index) => {
        const lineIndex = index % numPoints;
        const startIndex = lineIndex;
        const endIndex = (startIndex + 2) % numPoints;
        const start = points[startIndex];
        const end = points[endIndex];
        const individualProgress = (angle + index * 0.1) % (2 * Math.PI);
        const progress = individualProgress / (2 * Math.PI);
        let x, y;
        if (progress < 0.5) {
            const t = Math.sin(progress * Math.PI);
            x = start.x + (end.x - start.x) * t;
            y = start.y + (end.y - start.y) * t;
        } else {
            const t = Math.sin((progress - 0.5) * Math.PI);
            x = end.x + (start.x - end.x) * t;
            y = end.y + (start.y - end.y) * t;
        }
        const wobble = Math.sin(individualProgress * 4) * 2;
        bot.world.move(Math.round(x + wobble), Math.round(y + wobble));
    });
    angle += 0.03;
    if (angle > 2 * Math.PI) {
        angle -= 2 * Math.PI;
    }
}

function moveBotsInTriangle(centerX, centerY, length) {
    const sideLength = Math.max(length * 2, 20);
    const height = (Math.sqrt(3) / 2) * sideLength;
    const points = [
        { x: centerX, y: centerY - (2 / 3) * height },
        { x: centerX - sideLength / 2, y: centerY + (1 / 3) * height },
        { x: centerX + sideLength / 2, y: centerY + (1 / 3) * height }
    ];

    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    filteredBots.forEach((bot, index) => {
        const totalDistance = sideLength * 3;
        const botProgress = (index / length + angle) % 1;
        let x, y;

        if (botProgress < 1 / 3) {
            const t = botProgress * 3;
            x = points[0].x + (points[1].x - points[0].x) * t;
            y = points[0].y + (points[1].y - points[0].y) * t;
        } else if (botProgress < 2 / 3) {
            const t = (botProgress - 1 / 3) * 3;
            x = points[1].x + (points[2].x - points[1].x) * t;
            y = points[1].y + (points[2].y - points[1].y) * t;
        } else {
            const t = (botProgress - 2 / 3) * 3;
            x = points[2].x + (points[0].x - points[2].x) * t;
            y = points[2].y + (points[0].y - points[2].y) * t;
        }

        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.005;
    if (angle > 1) {
        angle -= 1;
    }
}

function moveBotsInPentagram(centerX, centerY, radius = 20, length) {
    const numPoints = 5;
    const angleStep = (Math.PI * 2) / numPoints;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    const starBots = filteredBots.slice(0, 5);
    const circleBots = filteredBots.slice(5);

    starBots.forEach((bot, index) => {
        const startPoint = points[index];
        const endPoint = points[(index + 2) % 5];
        const progress = angle % 1;

        let x, y;
        if (progress < 0.5) {
            x = startPoint.x + (endPoint.x - startPoint.x) * (progress * 2);
            y = startPoint.y + (endPoint.y - startPoint.y) * (progress * 2);
        } else {
            x = endPoint.x + (startPoint.x - endPoint.x) * ((progress - 0.5) * 2);
            y = endPoint.y + (startPoint.y - endPoint.y) * ((progress - 0.5) * 2);
        }

        bot.world.move(Math.round(x), Math.round(y));
    });

    circleBots.forEach((bot, index) => {
        const circleAngle = angle * 2 * Math.PI + (index / circleBots.length) * Math.PI * 2;
        const x = centerX + (radius * 1.5) * Math.cos(circleAngle);
        const y = centerY + (radius * 1.5) * Math.sin(circleAngle);
        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.005;
    if (angle > 1) angle -= 1;
}

function moveBotsInHexagon(centerX, centerY, radius = 20, length) {
    const numPoints = 6;
    const angleStep = (Math.PI * 2) / numPoints;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);

    filteredBots.forEach((bot, index) => {
        const startPoint = points[index % 6];
        const endPoint = points[(index + 1) % 6];
        const progress = angle % 1;

        let x, y;
        x = startPoint.x + (endPoint.x - startPoint.x) * progress;
        y = startPoint.y + (endPoint.y - startPoint.y) * progress;

        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.008;
    if (angle > 1) angle -= 1;
}

function moveBotsInInfinity(centerX, centerY, radius = 20, length) {
    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    const halfLength = Math.ceil(filteredBots.length / 2);

    filteredBots.forEach((bot, index) => {
        const progress = (angle + index / filteredBots.length) % 1;
        const theta = progress * 2 * Math.PI;

        let x, y;
        if (index < halfLength) {
            x = centerX - radius * Math.cos(theta);
            y = centerY + radius * Math.sin(theta) * Math.cos(theta);
        } else {
            x = centerX + radius * Math.cos(theta);
            y = centerY + radius * Math.sin(theta) * Math.cos(theta);
        }

        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.005;
    if (angle > 1) angle -= 1;
}

function moveBotsInX(centerX, centerY, radius = 10, length) {
    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    const halfLength = Math.ceil(filteredBots.length / 2);

    filteredBots.forEach((bot, index) => {
        const progress = (angle + index / filteredBots.length) % 1;
        const distance = progress * 2 * radius - radius;

        let x, y;
        if (index < halfLength) {
            x = centerX + distance;
            y = centerY + distance;
        } else {
            x = centerX - distance;
            y = centerY + distance;
        }

        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.008;
    if (angle > 1) angle -= 1;
}

function moveBotsInSpiral(centerX, centerY, length) {
    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    const spiralRadius = length;

    filteredBots.forEach((bot, index) => {
        const progress = (angle + index / filteredBots.length) % 1;
        const theta = progress * 2 * Math.PI;
        const radius = spiralRadius * progress;

        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta);

        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.005;
    if (angle > 1) angle -= 1;
}

function moveBotsInLine(centerX, centerY, length) {
    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    const halfLength = Math.ceil(filteredBots.length / 2);
    const lineLength = length * 2;

    filteredBots.forEach((bot, index) => {
        const progress = (angle + index / filteredBots.length) % 1;
        const distance = progress * lineLength - length;

        let x = centerX + distance;
        let y = centerY;

        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.01;
    if (angle > 1) angle -= 1;
}

function moveBotsInV2(centerX, centerY, length) {
    const filteredBots = bots.filter(bot => !bot.clientOptions.localplayer);
    const halfBots = Math.ceil(filteredBots.length / 2);
    const scale = length / 3; // Adjust scale for better visibility

    const vPoints = [
        [0, 0], [1, 2], [2, 0]
    ];
    const twoPoints = [
        [0, 0], [2, 0], [2, 1], [0, 1], [0, 2], [2, 2]
    ];

    filteredBots.forEach((bot, index) => {
        let points, totalPoints;
        if (index < halfBots) {
            points = vPoints;
            totalPoints = vPoints.length;
        } else {
            points = twoPoints;
            totalPoints = twoPoints.length;
        }

        const progress = (angle + (index % halfBots) / halfBots) % 2;
        let pointIndex, nextPointIndex, subProgress;

        if (progress < 1) {
            // Forward path
            pointIndex = Math.floor(progress * (totalPoints - 1));
            nextPointIndex = (pointIndex + 1) % totalPoints;
            subProgress = (progress * (totalPoints - 1)) % 1;
        } else {
            // Reverse path
            pointIndex = totalPoints - 1 - Math.floor((progress - 1) * (totalPoints - 1));
            nextPointIndex = Math.max(pointIndex - 1, 0);
            subProgress = 1 - ((progress - 1) * (totalPoints - 1)) % 1;
        }

        const currentPoint = points[pointIndex];
        const nextPoint = points[nextPointIndex];

        if (!currentPoint || !nextPoint) {
            console.error('Invalid point index:', pointIndex, nextPointIndex);
            return;
        }

        let x = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * subProgress;
        let y = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * subProgress;

        if (index >= halfBots) {
            x += 3; // Offset the "2" to the right of the "V"
        }

        x = centerX + scale * (x - 1);
        y = centerY + scale * (y - 1);

        bot.world.move(Math.round(x), Math.round(y));
    });

    angle += 0.005;
    if (angle > 2) angle -= 2;
}

function moveBotsInWave(centerX, centerY, length) {
    const amplitude = 10;
    const frequency = 2;
    const speed = 2;

    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const offset = index - Math.floor(length / 2); // Center the wave
        const x = centerX + offset;
        const y = centerY + Math.sin((offset * frequency) + (Date.now() * speed * 0.001)) * amplitude;
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInPlus(centerX, centerY, length) {
    const size = 10; // Size of the plus
    const halfSize = size / 2;
    const quarterBots = Math.floor(length / 4);
    const gap = 2; // Gap between bots

    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        let x, y;
        let progress = (Date.now() * 0.01 + index * 0.5) % (size * 2);
        let direction = Math.floor(progress / size) % 2 === 0 ? 1 : -1;
        let lineProgress = direction > 0 ? progress % size : size - (progress % size);

        if (index < quarterBots) {
            // Top part of the plus
            x = centerX;
            y = centerY - halfSize + lineProgress;
        } else if (index < 2 * quarterBots) {
            // Right part of the plus
            x = centerX + lineProgress;
            y = centerY;
        } else if (index < 3 * quarterBots) {
            // Bottom part of the plus
            x = centerX;
            y = centerY + lineProgress;
        } else {
            // Left part of the plus
            x = centerX - halfSize + lineProgress;
            y = centerY;
        }

        // Add gap between bots
        let adjustedIndex = index % quarterBots;
        if (index < quarterBots || (index >= 2 * quarterBots && index < 3 * quarterBots)) {
            y += adjustedIndex * gap;
        } else {
            x += adjustedIndex * gap;
        }

        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInFigure8(centerX, centerY, length) {
    const a = 20; // horizontal radius
    const b = 10; // vertical radius
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + a * Math.sin(t);
        const y = centerY + b * Math.sin(t) * Math.cos(t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInHeart(centerX, centerY, length) {
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + 16 * Math.pow(Math.sin(t), 3);
        const y = centerY - (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInRose(centerX, centerY, length) {
    const k = 5; // number of petals
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const r = 20 * Math.cos(k * t);
        const x = centerX + r * Math.cos(t);
        const y = centerY + r * Math.sin(t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInButterfly(centerX, centerY, length) {
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4*t) - Math.pow(Math.sin(t/12), 5)) * 10;
        const y = centerY + Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4*t) - Math.pow(Math.sin(t/12), 5)) * 10;
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInHypocycloid(centerX, centerY, length) {
    const R = 20; // radius of fixed circle
    const r = 7; // radius of rolling circle
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + (R-r) * Math.cos(t) + r * Math.cos((R-r)/r * t);
        const y = centerY + (R-r) * Math.sin(t) - r * Math.sin((R-r)/r * t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInEpicycloid(centerX, centerY, length) {
    const R = 20; // radius of fixed circle
    const r = 5; // radius of rolling circle
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + (R+r) * Math.cos(t) - r * Math.cos((R+r)/r * t);
        const y = centerY + (R+r) * Math.sin(t) - r * Math.sin((R+r)/r * t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInLissajous(centerX, centerY, length) {
    const A = 25, B = 25; // amplitudes
    const a = 3, b = 2; // frequencies
    const delta = Math.PI / 2; // phase difference
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + A * Math.sin(a * t + delta);
        const y = centerY + B * Math.sin(b * t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInAstroid(centerX, centerY, length) {
    const a = 25; // size factor
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + a * Math.pow(Math.cos(t), 3);
        const y = centerY + a * Math.pow(Math.sin(t), 3);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInRhodonea(centerX, centerY, length) {
    const k = 4; // number of petals
    const a = 25; // size factor
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const r = a * Math.cos(k * t);
        const x = centerX + r * Math.cos(t);
        const y = centerY + r * Math.sin(t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInSpirograph(centerX, centerY, length) {
    const R = 20; // radius of fixed circle
    const r = 7; // radius of moving circle
    const d = 10; // distance from center of moving circle
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + (R-r) * Math.cos(t) + d * Math.cos((R-r)/r * t);
        const y = centerY + (R-r) * Math.sin(t) - d * Math.sin((R-r)/r * t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}

function moveBotsInCardioid(centerX, centerY, length) {
    const a = 20; // size factor
    bots.filter(bot => !bot.clientOptions.localplayer).forEach((bot, index) => {
        const t = (index / length) * 2 * Math.PI + Date.now() * 0.001;
        const x = centerX + 2 * a * Math.cos(t) - a * Math.cos(2 * t);
        const y = centerY + 2 * a * Math.sin(t) - a * Math.sin(2 * t);
        bot.world.move(Math.round(x), Math.round(y));
    });
}


function updateAnimation() {
    const centerX = OWOP.mouse.tileX;
    const centerY = OWOP.mouse.tileY;
    const length = bots.filter(bot => !bot.clientOptions.localplayer).length;

    const animationFunctions = {
        "Circle": () => moveBotsInCircle(centerX, centerY, length),
        "Square": () => moveBotsInSquare(centerX, centerY, length),
        "Star": () => moveBotsInStar(centerX, centerY, length),
        "Triangle": () => moveBotsInTriangle(centerX, centerY, length),
        "Pentagram": () => moveBotsInPentagram(centerX, centerY, length),
        "Hexagon": () => moveBotsInHexagon(centerX, centerY, 20, length),
        "Infinity": () => moveBotsInInfinity(centerX, centerY, 20, length),
        "X": () => moveBotsInX(centerX, centerY, 10, length),
        "Spiral": () => moveBotsInSpiral(centerX, centerY, length),
        "Line": () => moveBotsInLine(centerX, centerY, length),
        "V2": () => moveBotsInV2(centerX, centerY, length),
        "Wave": () => moveBotsInWave(centerX, centerY, length),
        "Plus": () => moveBotsInPlus(centerX, centerY, length),
        "Figure8": () => moveBotsInFigure8(centerX, centerY, length),
        "Heart": () => moveBotsInHeart(centerX, centerY, length),
        "Rose": () => moveBotsInRose(centerX, centerY, length),
        "Butterfly": () => moveBotsInButterfly(centerX, centerY, length),
        "Hypocycloid": () => moveBotsInHypocycloid(centerX, centerY, length),
        "Epicycloid": () => moveBotsInEpicycloid(centerX, centerY, length),
        "Lissajous": () => moveBotsInLissajous(centerX, centerY, length),
        "Astroid": () => moveBotsInAstroid(centerX, centerY, length),
        "Rhodonea": () => moveBotsInRhodonea(centerX, centerY, length),
        "Cardioid": () => moveBotsInCardioid(centerX, centerY, length),
        "Spirograph": () => moveBotsInSpirograph(centerX, centerY, length),
    };

    const selectedAnimation = config.getValue("Animation");
    const animationFunction = animationFunctions[selectedAnimation];

    if (animationFunction) {
        animationFunction();

        bots.forEach(bot => {
            if (config.getValue("Paint Follow")) {
                bot.world.setPixel(bot.player.x, bot.player.y);
            }
            if (config.getValue("Tool Follow")) {
                const ToolID = Object.keys(OWOP.tools.allTools).indexOf(OWOP.player.tool.id);
                bot.world.setTool(ToolID);
            }
        });
    } else {
        console.warn(`Unknown animation type: ${selectedAnimation}`);
    }
}

function startAnimation() {
    if (animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(updateAnimation, 1000 / 60);
}

function stopAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
        angle = 0;
    }
}

export { startAnimation, stopAnimation };
