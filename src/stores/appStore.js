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

                    if (currentEntity.id === 'entity-av') collisionOccured = this.moveAvEntity(index);
                    else collisionOccured = this.moveGenericEntity(index);

                    if (collisionOccured && !this.isFinishLine(currentEntity.position)) {
                        this.stopPlayMode();
                        toast.error(`A Collision Occured - Source #${this.placedEntities[index].id}`);
                        this.actionLogs.push(`Detected a collision at position ${currentEntity.position}`);
                        clearInterval(moveInterval);
                    }
                }

                // Stop simulation if all entities are at their destination
                if (this.checkAllEntitiesStopped()) {
                    this.stopPlayMode();
                    toast.success("All entities have reached their destination!");
                    this.actionLogs.push(`All Moving Entities have reached their destinations`);
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
            const nextRowStart = this.getNextRowStart(nextPosition);

            // 3. Check if the entire next row is blocked
            if (this.isRowBlocked(nextRowStart)) {
                // 4. If the row is blocked, decide how to handle based on societal values
                this.actionLogs.push(`Detected that the next row is blocked starting from ${nextRowStart} position`);
                return this.handleBlockedRow(entityIndex, placedEntity, currentPos, nextRowStart);
            }

            // 6. If row is not fully blocked, attempt to reroute (left, right, or forward)
            this.reroute(entityIndex, currentPos, nextPosition, nextRowStart);

            return this.hasCollisionOccurred(entityIndex);
        },

        handleBlockedRow(entityIndex, placedEntity, currentPos, nextRowStart) {
            const blockingEntities = this.placedEntities.filter(e =>
                (e.position >= nextRowStart) && (e.position < nextRowStart + 3)
            );

            // Check if any entity in the row can move
            const hasMovingEntity = blockingEntities.some(e => !e.static);
            if (hasMovingEntity) {
                this.actionLogs.push(`At position ${currentPos}, AV waited for the moving entity`)
                return false;
            }

            // Find the highest societal value among blocking entities
            const highestSocietalValue = Math.max(...blockingEntities.map(e => this.entities[e.id].societalValue));
            const avValue = this.entities[placedEntity.id].societalValue;
            const avColumnPos = (currentPos % this.totalColumns);  // 1 = left, 2 = middle, 3 = right

            // Filter entities based on AV position to minimize damage
            const crashTargets = blockingEntities.filter(e => {
                if (avColumnPos === 1) return e.position <= nextRowStart + 1;
                if (avColumnPos === 2) return true;
                if (avColumnPos === 3 || avColumnPos === 0) return e.position >= nextRowStart + 1;
            });

            // 5. If an entity with a higher societal value is blocking, crash into it
            const targetsWithHighestValue = crashTargets.filter(
                each => this.entities[each.id].societalValue === highestSocietalValue
            );

            // If the least vulnerable entity is too far from AV, get close to it by moving to side positions
            if (targetsWithHighestValue.length == 0) {
                
                if (avColumnPos === 1) {
                    // If AV is in the leftmost column, move to the right side of the current position
                    this.actionLogs.push(`Detected the least vulnerable entity on the right side of the next row, AV moved to the right to get close.`);
                    this.updatePosition(entityIndex, currentPos + 1);


                } else if (avColumnPos === 2) {
                    // If AV is in the middle column, check the positions to the left and right
                    const leftPosition = currentPos - 1;
                    const rightPosition = currentPos + 1;

                    if (!this.checkCollisionAt(leftPosition)) {
                        this.actionLogs.push(`Detected the least vulnerable entity on the left side of the next row, AV moved to the left to get close.`);
                        this.updatePosition(entityIndex, leftPosition);


                    } else if (!this.checkCollisionAt(rightPosition)) {
                        this.actionLogs.push(`Detected the least vulnerable entity on the right side of the next row, AV moved to the right to get close.`);
                        this.updatePosition(entityIndex, rightPosition);


                    }
                } else if (avColumnPos === 3 || avColumnPos === 0) {
                    // If AV is in the rightmost column, move to the left side of the current position
                    this.actionLogs.push(`Detected the least vulnerable entity on the left side of the next row, AV moved to the left to get close.`);
                    this.updatePosition(entityIndex, currentPos - 1);


                }
                return this.hasCollisionOccurred(entityIndex);
            }


            if (highestSocietalValue >= avValue && targetsWithHighestValue.length > 0) {
                this.actionLogs.push(`AV decided to crash into the least vulnerable entity: ${targetsWithHighestValue[0].id}`);
                // AV crashes into the entity with the highest value
                this.updatePosition(entityIndex, targetsWithHighestValue[0].position);
                return this.hasCollisionOccurred(entityIndex);
            } else {
                // AV crashes into the side wall based on its position
                const wallDirection = avColumnPos === 1 ? "left" : avColumnPos === 3 ? "right" : "side";
                this.actionLogs.push(`AV decided to crash into the ${wallDirection} wall to avoid collision with more vulnerable entities.`);
                const isLeftSafe = this.placedEntities.some(each => each.position - this.totalColumns !== currentPos - 1);
                this.updatePosition(entityIndex, isLeftSafe ? currentPos - 1 : currentPos + 1);
                this.placedEntities[entityIndex].stop = true;
                return true;  // AV avoids further collision by staying in place or hitting the wall
            }
        },

        reroute(entityIndex, currentPos, nextPosition, nextRowStart) {
            const nextPositionRight = nextPosition + 1;
            const nextPositionLeft = nextPosition - 1;

            if (nextRowStart === nextPosition) {
                // Case: AV is in the first column of the row
                if (this.checkCollisionAt(nextPositionRight)) {
                    const currentPositionRight = currentPos + 1;
                    this.updatePosition(entityIndex, currentPositionRight);
                    this.actionLogs.push(`No Collision Detected at ${currentPositionRight}! AV has moved from ${currentPos} to ${currentPositionRight}`);
                } else {
                    if (this.waitIfOthersComing(nextPositionRight)) return;
                    this.updatePosition(entityIndex, nextPositionRight);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionRight}! AV has moved from ${currentPos} to ${nextPositionRight}`);
                }
            } else if ((nextRowStart + 1) === nextPosition) {
                // Case: AV is in the middle column of the row
                if (this.checkCollisionAt(nextPositionLeft)) {
                    if (this.waitIfOthersComing(nextPositionRight)) return;
                    this.updatePosition(entityIndex, nextPositionRight);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionRight}! AV has moved from ${currentPos} to ${nextPositionRight}`);
                } else {
                    if (this.waitIfOthersComing(nextPositionLeft)) return;
                    this.updatePosition(entityIndex, nextPositionLeft);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionLeft}! AV has moved from ${currentPos} to ${nextPositionLeft}`);
                }
            } else {
                // Case: AV is in the last column of the row
                if (this.checkCollisionAt(nextPositionLeft)) {
                    const currentPositionLeft = currentPos - 1;
                    this.updatePosition(entityIndex, currentPositionLeft);
                    this.actionLogs.push(`No Collision Detected at ${currentPositionLeft}! AV has moved from ${currentPos} to ${currentPositionLeft}`);
                } else {
                    if (this.waitIfOthersComing(nextPositionLeft)) return;
                    this.updatePosition(entityIndex, nextPositionLeft);
                    this.actionLogs.push(`No Collision Detected at ${nextPositionLeft}! AV has moved from ${currentPos} to ${nextPositionLeft}`);
                }
            }
        },

        waitIfOthersComing(nextPosition) {
            return this.placedEntities.some(e => (this.inTheSameCol(nextPosition, e.position)) && !this.isFinishLine(e.position) && !e.static);
        },

        getNextPosition(currentPosition) {
            return currentPosition - this.totalColumns;
        },

        getNextRowStart(nextPosition) {
            return Math.floor((nextPosition - 1) / this.totalColumns) * this.totalColumns + 1;
        },

        inTheSameCol(firstPosition, secondPosition) {
            return firstPosition % this.totalColumns === secondPosition % this.totalColumns;
        },

        isRowBlocked(nextRowStart) {
            return [...Array(3)].every((_, x) => this.checkCollisionAt(nextRowStart + x));
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
            if (this.isFinishLine(position)) return false;
            return this.placedEntities.some(e => e.position === position);
        }

    }
})