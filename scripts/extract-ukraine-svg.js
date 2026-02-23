const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/ukraine.geojson', 'utf8'));

const ukraine = data.features.find(f =>
    f.properties.name === 'Ukraine'
);

const minLon = 21.5, maxLon = 41.0;
const minLat = 44.0, maxLat = 53.0;
const svgW = 800, svgH = 500;

function project(lon, lat) {
    const x = ((lon - minLon) / (maxLon - minLon)) * svgW;
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgH;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

// Douglas-Peucker simplification
function sqDist(p, a, b) {
    let dx = b[0] - a[0], dy = b[1] - a[1];
    if (dx !== 0 || dy !== 0) {
        let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
        if (t > 1) { a = b; }
        else if (t > 0) { a = [a[0] + dx * t, a[1] + dy * t]; }
    }
    dx = p[0] - a[0]; dy = p[1] - a[1];
    return dx * dx + dy * dy;
}

function simplify(points, tolerance) {
    if (points.length <= 2) return points;
    let maxDist = 0, maxIdx = 0;
    for (let i = 1; i < points.length - 1; i++) {
        let d = sqDist(points[i], points[0], points[points.length - 1]);
        if (d > maxDist) { maxDist = d; maxIdx = i; }
    }
    if (maxDist > tolerance * tolerance) {
        let left = simplify(points.slice(0, maxIdx + 1), tolerance);
        let right = simplify(points.slice(maxIdx), tolerance);
        return left.slice(0, -1).concat(right);
    }
    return [points[0], points[points.length - 1]];
}

function processCoords(coords, tolerance) {
    const projected = coords.map(c => project(c[0], c[1]));
    const simplified = simplify(projected, tolerance);
    let path = 'M' + simplified[0].join(',');
    for (let i = 1; i < simplified.length; i++) {
        path += 'L' + simplified[i].join(',');
    }
    path += 'Z';
    return { path, originalPoints: projected.length, simplifiedPoints: simplified.length };
}

// Process all polygons with tolerance to reduce points
const tolerance = 2.0; // pixels tolerance
let allPaths = [];
let totalOriginal = 0;
let totalSimplified = 0;

if (ukraine.geometry.type === 'MultiPolygon') {
    ukraine.geometry.coordinates.forEach((polygon, pi) => {
        polygon.forEach((ring, ri) => {
            const result = processCoords(ring, tolerance);
            // Skip very small polygons (tiny islands with < 5 points after simplification)
            if (result.simplifiedPoints >= 5) {
                allPaths.push(result.path);
                totalOriginal += result.originalPoints;
                totalSimplified += result.simplifiedPoints;
                console.error(`Polygon ${pi}, ring ${ri}: ${result.originalPoints} -> ${result.simplifiedPoints} points`);
            } else {
                console.error(`Polygon ${pi}, ring ${ri}: SKIPPED (${result.simplifiedPoints} pts after simplification)`);
            }
        });
    });
}

console.error(`\nTotal: ${totalOriginal} -> ${totalSimplified} points`);

// Output only the path
const combinedPath = allPaths.join(' ');
console.log(combinedPath);

// Output size
console.error(`Path size: ${combinedPath.length} characters`);
