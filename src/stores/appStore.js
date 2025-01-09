import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'

const toast = useToast();

export const useAppStore = defineStore('app', {

    state: () => {
        return {
            overlay: false,
            modalComponent: null,
            modalProps: null,
            playMode: false,
            showClearButton: false,
            entities: {
                "entity-pedestrain": {
                    id: "entity-pedestrain",
                    name: "pedestrain",
                    content: "🚶",
                    societalValue: 1,
                    speed: 120,
                    canMove: true
                },
                "entity-cyclist": {
                    id: "entity-cyclist",
                    name: "cyclist",
                    content: "🚴",
                    societalValue: 1,
                    speed: 200,
                    canMove: true
                },
                "entity-av": {
                    id: "entity-av",
                    name: "av",
                    content: "🚙",
                    societalValue: 3,
                    speed: 100,
                    canMove: true
                },
                "entity-truck": {
                    id: "entity-truck",
                    name: "truck",
                    content: "🛻",
                    societalValue: 3,
                    speed: 80,
                    canMove: true
                },
                "entity-car": {
                    id: "entity-car",
                    name: "car",
                    content: "🚗",
                    societalValue: 3,
                    speed: 150,
                    canMove: true
                },
                "entity-motorcycle": {
                    id: "entity-motorcycle",
                    name: "motorcycle",
                    content: "🏍️",
                    societalValue: 1,
                    speed: 180,
                    canMove: true
                },
                "entity-ambulance": {
                    id: "entity-ambulance",
                    name: "ambulance",
                    content: "🚑",
                    societalValue: 2,  // High priority for avoiding collision
                    speed: 140,
                    canMove: true
                },
                "entity-bus": {
                    id: "entity-bus",
                    name: "bus",
                    content: "🚌",
                    societalValue: 2,
                    speed: 90,
                    canMove: true
                },
                "entity-firetruck": {
                    id: "entity-firetruck",
                    name: "firetruck",
                    content: "🚒",
                    societalValue: 2,
                    speed: 100,
                    canMove: true
                },
                "entity-tree": {
                    id: "entity-tree",
                    name: "tree",
                    content: "🌳",
                    societalValue: Infinity,  // Obstacle, but not a living being
                    speed: 0,
                    canMove: false
                },
                "entity-cone": {
                    id: "entity-cone",
                    name: "traffic cone",
                    content: "🚧",
                    societalValue: Infinity,
                    speed: 0,
                    canMove: false
                },
                "entity-barrier": {
                    id: "entity-barrier",
                    name: "barrier",
                    content: "🛑",
                    societalValue: Infinity,
                    speed: 0,
                    canMove: false
                },
                "entity-animal": {
                    id: "entity-animal",
                    name: "animal",
                    content: "🐕",
                    societalValue: 3,
                    speed: 60,
                    canMove: true
                },
                "entity-pothole": {
                    id: "entity-pothole",
                    name: "pothole",
                    content: "🕳️",
                    societalValue: Infinity,
                    speed: 0,
                    canMove: false
                },
                "entity-elderly": {
                    id: "entity-elderly",
                    name: "elderly person",
                    content: "👵",
                    societalValue: 1,
                    speed: 80,
                    canMove: true
                }
            },
            placedEntities: [],
            backupEntities: [],
            actionLogs: [],
            totalColumns: 3,
            totalRows: 12,
            maxEntities: 10,
        }
    },

    actions: {

        isStartingLine(index) {
            index--;
            return index >= (this.totalColumns * (this.totalRows - 1)) && index < this.totalColumns * this.totalRows;
            // Starting line at the last row
        },

        isFinishLine(index) {
            index--;
            return index >= 0 && index < this.totalColumns;
            // Finish line at the top row
        },

        openModal(modalComponent, modalProps) {
            this.modalComponent = modalComponent;
            this.modalProps = modalProps;
            this.overlay = true;
        },

        closeModal() {
            this.overlay = false;
            this.modalComponent = null;
            this.modalProps = null;
        },

        isMaxed() {
            if (this.placedEntities.length >= this.maxEntities) return true;
            return false;
        },

        allowedToBePlaced(id, position) {
            // Check if the entity being placed is an AV
            if (this.entities[id].name === 'av') {
                // Allow placement only if there are no other AV entities and AV must be at the starting line
                return (!this.placedEntities.some(e => this.entities[e.id].name === 'av')) && this.isStartingLine(position);
            }

            if (!this.entities[id].canMove && this.isStartingLine(position)) return;
            return true; // Allow placement for other entities
        },

        placeEntity(id, position) {
            if (!this.placedEntities.find(e => e.position === position)) {
                this.placedEntities.push({
                    id,
                    position,
                    static: !this.isStartingLine(position) ? true : false,
                    stop: false
                });
            }
        },

        startPlayMode() {
            if (this.placedEntities.length <= 0) {
                toast.error("Place an entity first");
                return;
            }

            // Sort to ensure AV is the last entity in placedEntities
            this.placedEntities.sort((a, b) => {
                return a.id === 'entity-av' ? 1 : b.id === 'entity-av' ? -1 : 0;
            });

            if (this.placedEntities[this.placedEntities.length - 1].id != 'entity-av') {
                toast.error("AV entity must be included");
                return;
            }

            this.playMode = true;
            this.createBackup();
            this.runEntityMovements();
        },

        stopPlayMode() {
            this.playMode = false;
            this.showClearButton = true;
        },

        clearEntities() {
            this.actionLogs = [];
            this.placedEntities = [];
            this.stuckCounter = 0;
            this.showClearButton = false;  // Hide the button until next play mode
        },

        createBackup() {
            this.backupEntities = JSON.parse(JSON.stringify(this.placedEntities));
        },

        restartSimulation() {
            if (this.backupEntities.length > 0) {
                this.placedEntities = JSON.parse(JSON.stringify(this.backupEntities));
                this.playMode = true;
                this.stuckCounter = 0;
                this.actionLogs = [];
                this.runEntityMovements();
            } else {
                toast.error('No backup available to restart!');
            }
        },

        removeEntity(cellIndex) {
            this.placedEntities = this.placedEntities.filter(e => e.position !== cellIndex);
        },

        runEntityMovements() {

            let collisionOccured = false;

            const moveInterval = setInterval(() => {

                if (!this.playMode) {
                    clearInterval(moveInterval);
                    return;
                }

                for (let index = 0; index < this.placedEntities.length; index++) {
                    const currentEntity = this.placedEntities[index];

                    if (currentEntity.stop || currentEntity.static || !this.istimeToMove(currentEntity, this.entities[currentEntity.id].speed)) continue;

                    if (currentEntity.id === 'entity-av') {
                        collisionOccured = this.moveAvEntity(index);
                    }
                    else collisionOccured = this.moveGenericEntity(index);

                    if (collisionOccured) {
                        this.stopPlayMode();
                        toast.error("A Collision Occured");
                        this.actionLogs.push(`Detected a collision at position ${currentEntity.position}`);
                        clearInterval(moveInterval);
                    }
                }

                // Stop simulation if all entities are at their destination
                if (this.checkAllEntitiesStopped()) {
                    this.stopPlayMode();
                    toast.success("All entities have reached their destination!");
                    clearInterval(moveInterval);
                }


            }, 50);
        },

        checkAllEntitiesStopped() {
            return this.placedEntities.every(entity => entity.stop || entity.static);
        },

        moveGenericEntity(entityIndex) {
            const placedEntity = this.placedEntities[entityIndex];
            const nextPosition = placedEntity.position - this.totalColumns;

            if (nextPosition >= 0) {
                this.updatePosition(entityIndex, nextPosition);
                return this.hasCollisionOccurred(entityIndex);
            }
            return true;
        },

        moveAvEntity(entityIndex) {
            const placedEntity = this.placedEntities[entityIndex];
            const currentPos = placedEntity.position;
            const nextPosition = currentPos - this.totalColumns; // Position directly above the current one

            // 1. Check if the next cell is free (normal forward movement)
            if (!this.checkCollisionAt(nextPosition)) {
                this.updatePosition(entityIndex, nextPosition);
                this.actionLogs.push(`No Collision Detected! AV has moved from ${currentPos} to ${nextPosition}`);
                return this.hasCollisionOccurred(entityIndex);  // Movement successful
            }

            // 2. Calculate the starting point of the next row
            const nextRowStart = Math.floor((nextPosition - 1) / this.totalColumns) * this.totalColumns + 1;

            console.log("Current Position", currentPos);
            console.log("Next Row Start", nextRowStart);

            // 3. Check if the entire next row is blocked
            let isRowBlocked = true;
            for (let x = nextRowStart; x < nextRowStart + 3; x++) {  // Loop through 3 cells in the next row
                if (!this.checkCollisionAt(x)) {
                    console.log(`At position, ${x}`, this.checkCollisionAt(x))
                    isRowBlocked = false;
                    break;  // If any cell is free, stop checking
                }
            }

            
            // 4. If the row is blocked, decide how to handle based on societal values
            if (isRowBlocked) {
                this.actionLogs.push(`Detected that the next row is blocked starting from ${nextRowStart} position`);
                const blockingEntities = this.placedEntities.filter(e =>
                    (e.position === nextRowStart) || (e.position === nextRowStart + 1) || (e.position === nextRowStart + 2)
                );

                // Find the highest societal value among blocking entities
                const highestSocietalValue = Math.max(...blockingEntities.map(e => this.entities[e.id].societalValue));
                const avValue = this.entities[placedEntity.id].societalValue;
                const avColumnPos = (currentPos % this.totalColumns);  // 1 = left, 2 = middle, 3 = right

                // Filter entities based on AV position to minimize damage
                let crashTargets = [];
                if (avColumnPos === 1) {
                    // AV is on the left, consider grid 1 or 2
                    crashTargets = blockingEntities.filter(e => e.position === nextRowStart || e.position === nextRowStart + 1);
                } else if (avColumnPos === 2) {
                    // AV is in the middle, consider all three grids 1, 2, or 3
                    crashTargets = blockingEntities;
                } else if (avColumnPos === 3) {
                    // AV is on the right, consider grid 2 or 3
                    crashTargets = blockingEntities.filter(e => e.position === nextRowStart + 1 || e.position === nextRowStart + 2);
                }

                console.log("Column", avColumnPos);
                console.log("Targets", crashTargets);

                // 5. If an entity with a higher societal value is blocking, crash into it
                const targetsWithHighestValue = crashTargets.filter(
                    each => this.entities[each.id].societalValue === highestSocietalValue
                );

                if (highestSocietalValue >= avValue && targetsWithHighestValue.length > 0) {
                    // AV crashes into the entity with the highest value
                    this.updatePosition(entityIndex, targetsWithHighestValue[0].position);
                    return this.hasCollisionOccurred(entityIndex);
                } else {
                    // AV crashes into the side wall based on its position
                    if (avColumnPos === 1) {
                        toast.error("Crash into left wall");
                    } else if (avColumnPos === 3) {
                        toast.error("Crash into right wall");
                    } else {
                        toast.error("Crash into side wall");
                        const isLeftSafe = this.placedEntities.some(each => each.position - this.totalColumns !== this.currentPos - 1);
                        if (isLeftSafe) {
                            this.updatePosition(entityIndex, currentPos - 1);
                            toast.error("Crash into Left Side wall");
                        } else {
                            this.updatePosition(entityIndex, currentPos + 1);
                            toast.error("Crash into Right Side wall");

                        }
                    }
                    return true;  // AV avoids further collision by staying in place or hitting the wall
                }
            }


            // 6. If row is not fully blocked, attempt to reroute (left, right, or forward)
            if (nextRowStart === nextPosition) {
                // Case: AV is in the first column of the row
                const nextPositionRight = nextPosition + 1;

                if (this.checkCollisionAt(nextPositionRight)) {
                    // If blocked to the right, move right at current row
                    this.updatePosition(entityIndex, currentPos + 1);
                    this.actionLogs.push(`No Collision Detected at ${currentPos + 1}! AV has moved from ${currentPos} to ${currentPos + 1}`);

                } else {
                    // Move forward to the next row's right cell
                    this.updatePosition(entityIndex, nextPositionRight);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionRight}! AV has moved from ${currentPos} to ${nextPositionRight}`);
                }

                return this.hasCollisionOccurred(entityIndex);

            } else if ((nextRowStart + 1) === nextPosition) {
                // Case: AV is in the middle column of the row
                const nextPositionLeft = nextPosition - 1;
                const nextPositionRight = nextPosition + 1;

                // Prioritize left if free, otherwise move right
                if (this.checkCollisionAt(nextPositionLeft)) {
                    this.updatePosition(entityIndex, nextPositionRight);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionRight}! AV has moved from ${currentPos} to ${nextPositionRight}`);

                } else {
                    this.updatePosition(entityIndex, nextPositionLeft);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionLeft}! AV has moved from ${currentPos} to ${nextPositionLeft}`);

                }

                return this.hasCollisionOccurred(entityIndex);

            } else {
                // Case: AV is in the last column of the row
                const nextPositionLeft = nextPosition - 1;

                if (this.checkCollisionAt(nextPositionLeft)) {
                    // If blocked to the left, move left at current row
                    this.updatePosition(entityIndex, currentPos - 1);
                    this.actionLogs.push(`No Collision Detected at ${currentPos - 1}! AV has moved from ${currentPos} to ${currentPos - 1}`);

                } else {
                    // Move forward to the next row's left cell
                    this.updatePosition(entityIndex, nextPositionLeft);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionLeft}! AV has moved from ${currentPos} to ${nextPositionLeft}`);

                }

                return this.hasCollisionOccurred(entityIndex);
            }
        },

        istimeToMove(placedEntity, speed) {
            return !placedEntity.lastMoveTime || Date.now() - placedEntity.lastMoveTime >= speed;
        },

        updatePosition(entityIndex, nextPosition) {
            const placedEntity = this.placedEntities[entityIndex];
            placedEntity.position = nextPosition;
            placedEntity.lastMoveTime = Date.now();
            this.actionLogs.push(`${placedEntity.id} has moved to ${placedEntity.position}`)

            if (this.isFinishLine(nextPosition)) placedEntity.stop = true;
        },

        hasCollisionOccurred(entityIndex) {
            for (let index = 0; index < this.placedEntities.length; index++) {
                if (index === entityIndex) continue;
                if (this.placedEntities[index].position === this.placedEntities[entityIndex].position) return true;
            }

            return false;
        },

        checkCollisionAt(position) {
            return this.placedEntities.some(e => e.position === position);
        }

    }
})