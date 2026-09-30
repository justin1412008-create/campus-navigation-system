const graph = {
    "Main Gate": { "Admin Block": 70 },
    "Admin Block": { "Main Gate": 70, "CSE Block": 80, "ECE Block": 60, "Library": 100 },
    "CSE Block": { "Admin Block": 80, "ECE Block": 50, "Hostel": 120 },
    "ECE Block": { "Admin Block": 60, "CSE Block": 50, "Mechanical Block": 60, "Library": 90 },
    "Mechanical Block": { "ECE Block": 60 },
    "Library": { "Admin Block": 100, "ECE Block": 90, "Cafeteria": 100, "Auditorium": 120 },
    "Hostel": { "CSE Block": 120, "Auditorium": 140 },
    "Cafeteria": { "Library": 100, "Auditorium": 80 },
    "Auditorium": { "Library": 120, "Hostel": 140, "Cafeteria": 80 },
    
};

const WALKING_SPEED = 84;

function getElementId(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
}

function getTime(distance) {
    return Math.max(1, Math.round(distance / WALKING_SPEED));
}

function dijkstra(start, end) {
    const distances = {};
    const previous = {};
    const unvisited = [];

    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
        unvisited.push(node);
    }

    distances[start] = 0;

    while (unvisited.length > 0) {
        unvisited.sort((a, b) => distances[a] - distances[b]);
        const current = unvisited.shift();
        if (current === end) break;
        for (const neighbor in graph[current]) {
            const newDistance = distances[current] + graph[current][neighbor];
            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = current;
            }
        }
    }

    const path = [];
    let cur = end;
    if (!previous[cur] && cur !== start && distances[cur] === Infinity) {
        return { path: [], distance: Infinity };
    }

    while (cur) {
        path.unshift(cur);
        cur = previous[cur];
    }

    return { path, distance: distances[end] };
}

function drawNetwork(route = []) {
    const svg = document.getElementById('routeSvg');
    if (!svg) return;
    svg.innerHTML = '';
    const drawnEdges = new Set();

    for (const fromNode in graph) {
        for (const toNode in graph[fromNode]) {
            const key = [fromNode, toNode].sort().join('-');
            if (drawnEdges.has(key)) continue;
            drawnEdges.add(key);

            const fromEl = document.getElementById(getElementId(fromNode));
            const toEl = document.getElementById(getElementId(toNode));
            if (!fromEl || !toEl) continue;

            const x1 = fromEl.offsetLeft + fromEl.offsetWidth / 2;
            const y1 = fromEl.offsetTop + fromEl.offsetHeight / 2;
            const x2 = toEl.offsetLeft + toEl.offsetWidth / 2;
            const y2 = toEl.offsetTop + toEl.offsetHeight / 2;

            let selected = false;
            for (let i = 0; i < route.length - 1; i++) {
                const a = route[i];
                const b = route[i + 1];
                if ((a === fromNode && b === toNode) || (a === toNode && b === fromNode)) selected = true;
            }

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', selected ? 'red' : 'green');
            line.setAttribute('stroke-width', selected ? '8' : '4');
            svg.appendChild(line);

            const distance = graph[fromNode][toNode];
            const time = getTime(distance);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', (x1 + x2) / 2);
            text.setAttribute('y', (y1 + y2) / 2 - 10);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', '#000');
            text.textContent = `${distance}m • ${time} min`;
            svg.appendChild(text);
        }
    }
}

function showSelection() {
    const start = document.getElementById('start').value;
    const destination = document.getElementById('destination').value;
    const result = dijkstra(start, destination);

    document.querySelectorAll('.location').forEach(function(el) {
        el.classList.remove('route-active');
    });

    result.path.forEach(function(node) {
        const el = document.getElementById(getElementId(node));
        if (el) el.classList.add('route-active');
    });

    drawNetwork(result.path);

    const totalTime = getTime(result.distance);
    const resultEl = document.getElementById('result');
    if (!resultEl) return;

    if (result.distance === Infinity || result.path.length === 0) {
        resultEl.innerHTML = `<p>No route found from ${start} to ${destination}.</p>`;
        return;
    }

    resultEl.innerHTML = `
        <h3>Route Found</h3>
        <p><b>From:</b> ${start}</p>
        <p><b>To:</b> ${destination}</p>
        <p><b>Total Distance:</b> ${result.distance} m</p>
        <p><b>Estimated Walking Time:</b> ${totalTime} min</p>
        <hr>
        ${result.path.join('<br>↓<br>')}
    `;
}

window.addEventListener('load', function() {
    drawNetwork();
    // expose for console/testing
    window.showSelection = showSelection;
});
