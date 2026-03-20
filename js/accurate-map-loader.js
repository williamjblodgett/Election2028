/**
 * Election 2028 - Accurate US map loader
 * Fetches public GeoJSON and converts it into the existing SVG state-path format.
 */

window.USAccurateMapLoader = {
    GEOJSON_URL: 'https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json',
    CACHE_KEY: 'election2028_us_geojson_v1',
    _loadingPromise: null,
    _loaded: false,

    preload() {
        if (this._loaded) return Promise.resolve(window.USMapPaths.states);
        if (this._loadingPromise) return this._loadingPromise;

        this._loadingPromise = this.loadGeoJSON()
            .then((geojson) => {
                const generated = this.buildStatePaths(geojson);
                if (generated && Object.keys(generated).length >= 51) {
                    window.USMapPaths.states = generated;
                    window.USMapPaths.isAccurate = true;
                    this._loaded = true;
                }
                return window.USMapPaths.states;
            })
            .catch((error) => {
                console.warn('Accurate map load failed, using bundled map paths.', error);
                return window.USMapPaths.states;
            });

        return this._loadingPromise;
    },

    async loadGeoJSON() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (error) {
                localStorage.removeItem(this.CACHE_KEY);
            }
        }

        const response = await fetch(this.GEOJSON_URL, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Map geometry request failed with status ${response.status}`);
        }

        const geojson = await response.json();
        try {
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(geojson));
        } catch (error) {
            // Ignore storage quota issues; runtime fetch succeeded.
        }
        return geojson;
    },

    normalizeName(name) {
        return String(name || '').replace(/\s+/g, ' ').trim();
    },

    getStateIdByName(name) {
        const normalized = this.normalizeName(name);
        const state = window.StateData.find((entry) => entry.name === normalized);
        if (state) return state.id;
        if (normalized === 'District of Columbia') return 'DC';
        return null;
    },

    getGeometryGroups(feature) {
        const geometry = feature.geometry || {};
        if (geometry.type === 'Polygon') return [geometry.coordinates];
        if (geometry.type === 'MultiPolygon') return geometry.coordinates;
        return [];
    },

    getRawBounds(groups) {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const polygon of groups) {
            for (const ring of polygon) {
                for (const [lon, lat] of ring) {
                    const x = lon;
                    const y = -lat;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        return { minX, maxX, minY, maxY };
    },

    mergeBounds(boundsList) {
        return boundsList.reduce((merged, bounds) => ({
            minX: Math.min(merged.minX, bounds.minX),
            maxX: Math.max(merged.maxX, bounds.maxX),
            minY: Math.min(merged.minY, bounds.minY),
            maxY: Math.max(merged.maxY, bounds.maxY),
        }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
    },

    getTargetBox(stateId) {
        if (stateId === 'AK') return { x: 24, y: 388, width: 220, height: 152 };
        if (stateId === 'HI') return { x: 260, y: 470, width: 110, height: 72 };
        return { x: 132, y: 20, width: 790, height: 500 };
    },

    createTransform(bounds, box) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        const scale = Math.min(box.width / width, box.height / height);
        const offsetX = box.x + ((box.width - (width * scale)) / 2) - (bounds.minX * scale);
        const offsetY = box.y + ((box.height - (height * scale)) / 2) - (bounds.minY * scale);

        return (lon, lat) => {
            const rawX = lon;
            const rawY = -lat;
            return {
                x: (rawX * scale) + offsetX,
                y: (rawY * scale) + offsetY,
            };
        };
    },

    getLabelOverrides() {
        return {
            DC: { dx: 14, dy: 12, fontSize: 5, circle: true, r: 4 },
            DE: { dx: 8, dy: 8, fontSize: 6 },
            MD: { dx: 20, dy: 16, fontSize: 6 },
            NJ: { dx: 10, dy: 10, fontSize: 6 },
            CT: { dx: 12, dy: 10, fontSize: 6 },
            RI: { dx: 18, dy: 6, fontSize: 5 },
            MA: { dx: 14, dy: 8, fontSize: 6 },
            VT: { dx: -10, dy: 8, fontSize: 6 },
            NH: { dx: 10, dy: 4, fontSize: 6 },
        };
    },

    projectGroups(groups, transform) {
        return groups.map((polygon) => polygon.map((ring) => ring.map(([lon, lat]) => transform(lon, lat))));
    },

    buildPath(projectedGroups) {
        const parts = [];
        for (const polygon of projectedGroups) {
            for (const ring of polygon) {
                ring.forEach((point, index) => {
                    parts.push(`${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`);
                });
                parts.push('Z');
            }
        }
        return parts.join(' ');
    },

    getProjectedBounds(projectedGroups) {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const polygon of projectedGroups) {
            for (const ring of polygon) {
                for (const point of ring) {
                    minX = Math.min(minX, point.x);
                    maxX = Math.max(maxX, point.x);
                    minY = Math.min(minY, point.y);
                    maxY = Math.max(maxY, point.y);
                }
            }
        }

        return { minX, maxX, minY, maxY };
    },

    buildStatePaths(geojson) {
        const byState = {};
        const lower48Bounds = [];
        const rawFeatures = [];

        for (const feature of geojson.features || []) {
            const stateId = this.getStateIdByName(feature.properties && feature.properties.name);
            if (!stateId || stateId === 'PR') continue;

            const groups = this.getGeometryGroups(feature);
            if (!groups.length) continue;

            const rawBounds = this.getRawBounds(groups);
            rawFeatures.push({ stateId, groups, rawBounds });
            if (stateId !== 'AK' && stateId !== 'HI') {
                lower48Bounds.push(rawBounds);
            }
        }

        const sharedLower48Bounds = this.mergeBounds(lower48Bounds);
        const overrides = this.getLabelOverrides();

        for (const feature of rawFeatures) {
            const targetBox = this.getTargetBox(feature.stateId);
            const bounds = feature.stateId === 'AK' || feature.stateId === 'HI' ? feature.rawBounds : sharedLower48Bounds;
            const transform = this.createTransform(bounds, targetBox);
            const projectedGroups = this.projectGroups(feature.groups, transform);
            const projectedBounds = this.getProjectedBounds(projectedGroups);
            const centerX = (projectedBounds.minX + projectedBounds.maxX) / 2;
            const centerY = (projectedBounds.minY + projectedBounds.maxY) / 2;
            const override = overrides[feature.stateId] || {};

            if (override.circle) {
                byState[feature.stateId] = {
                    circle: true,
                    cx: Number((centerX + (override.dx || 0)).toFixed(2)),
                    cy: Number((centerY + (override.dy || 0)).toFixed(2)),
                    r: override.r || 4,
                    fontSize: override.fontSize || 5,
                };
                continue;
            }

            byState[feature.stateId] = {
                d: this.buildPath(projectedGroups),
                cx: Number((centerX + (override.dx || 0)).toFixed(2)),
                cy: Number((centerY + (override.dy || 0)).toFixed(2)),
                fontSize: override.fontSize,
            };
        }

        return byState;
    },
};