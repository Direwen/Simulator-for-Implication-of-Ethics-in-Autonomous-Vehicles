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
                "entity-pedestrain" : {
                    id: "entity-pedestrain",
                    name: "pedestrain",
                    content: "🚶",
                    societalValue: 1,
                    speed: 120
                },
                "entity-cyclist" : {
                    id: "entity-cyclist",
                    name: "cyclist",
                    content: "🚴",
                    societalValue: 2,
                    speed: 200
                },
                "entity-av" : {
                    id: "entity-av",
                    name: "av",
                    content: "🚙",
                    societalValue: 3,
                    speed: 100
                },
                "entity-truck" : {
                    id: "entity-truck",
                    name: "truck",
                    content: "🛻",
                    societalValue: 2,
                    speed: 80
                },

            },
            placedEntities: [],
            backupEntities: [],
            totalColumns: 5,
            totalRows: 10,
            maxEntities: 10,
            stuckCounter: 0,   // New counter for intervals with no movement
            maxStuckIntervals: 10,  // Number of intervals to wait before stopping
        }
    },

    actions: {
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

        allowedToBePlaced(entityId) {
            // Check if the entity being placed is an AV
            if (this.entities[entityId].name === 'av') {
                // Allow placement only if there are no other AV entities
                return !this.placedEntities.some(e => this.entities[e.entityId].name === 'av');
            }
            return true; // Allow placement for other entities
        },

        placeEntity(entityId, position) {
            if (!this.placedEntities.find(e => e.position === position)) {
                const direction = this.getDirection(position);
                this.placedEntities.push({ entityId, position, direction });
            }
        },
        getDirection(position) {
            let direction = '';

            const row = Math.floor(position / this.totalColumns);
            const col = position % this.totalColumns;

            if (col === 0) direction = 'right';
            else if (col === this.totalColumns - 1) direction = 'left';
            else if (row === 0) direction = 'down';
            else if (row === this.totalRows - 1) direction = 'up';
            
            return direction;
        },
   
        startPlayMode() {
            if (this.placedEntities.length <= 0) {
                toast.error("Place an entity first");
                return;
            }

            // Ensure that if there's an AV entity, it is the last one in placedEntities
            // Sort to ensure AV is the last entity in placedEntities
            this.placedEntities.sort((a, b) => {
                return a.entityId === 'entity-av' ? 1 : b.entityId === 'entity-av' ? -1 : 0;
            });

            if (this.placedEntities[this.placedEntities.length - 1].entityId != 'entity-av') {
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
                this.runEntityMovements();
            } else {
                toast.error('No backup available to restart!');
            }
        },
        
        removeEntity(cellIndex) {
            this.placedEntities = this.placedEntities.filter(e => e.position !== cellIndex);
        },
        
        runEntityMovements() {
            const moveInterval = setInterval(() => {
                if (!this.playMode) {
                    clearInterval(moveInterval);
                    return;
                }
        
                let anyEntityMoved = false;
        
                for (let i = 0; i < this.placedEntities.length; i++) {
                    const entity = this.placedEntities[i];
                    const prevPosition = entity.position;
                    if ((entity.entityId != 'entity-av') ? !this.moveGenericEntity(i) : !this.moveAvEntity(i)) {
                        toast.error(`A Collision occurred at ${entity.position}\n#Culprit => ${entity.entityId}`);
                        this.stopPlayMode();
                        clearInterval(moveInterval);
                        return;
                    }
                    if (entity.position !== prevPosition) {
                        anyEntityMoved = true;
                    }
                }
        
                // Reset stuck counter if any entity moves
                if (anyEntityMoved) this.stuckCounter = 0; 
                else this.stuckCounter++;
                
                // Stop play mode if no movement for multiple intervals
                if (this.stuckCounter >= this.maxStuckIntervals) {
                    this.stopPlayMode();
                    clearInterval(moveInterval);  // Stop the interval properly
                    return;
                }

            }, 50);
        },

        moveGenericEntity(index) {
            const placedEntity = this.placedEntities[index];
            const entityDetails = this.entities[placedEntity.entityId];
            if (this.istimeToMove(placedEntity, entityDetails)) {
                //Detect Collision with AV
                if (!this.detectCollisionsWithAv(index, this.placedEntities)) {
                    this.updatePosition(index);
                    placedEntity.lastMoveTime = Date.now();
                }
            }
            return this.checkCollisions(index, this.placedEntities);
        },
        
        moveAvEntity(index) {
            const placedEntity = this.placedEntities[index];
            const entityDetails = this.entities[placedEntity.entityId];
            if (this.istimeToMove(placedEntity, entityDetails)) {
                // Predict Collisions
                this.predictCollisions(index, this.placedEntities);
                this.updatePosition(index);
                placedEntity.lastMoveTime = Date.now();
            }
            //Detect Collision
            return this.checkCollisions(index, this.placedEntities);
        },
        
        istimeToMove(placedEntity, entityDetails) {
            return !placedEntity.lastMoveTime || Date.now() - placedEntity.lastMoveTime >= entityDetails.speed;
        },

        updatePosition(index) {
            switch (this.placedEntities[index].direction) {
                case 'up':
                    if (this.placedEntities[index].position - this.totalColumns >= 0) {
                        this.placedEntities[index].position -= this.totalColumns;
                    }
                    break;
                case 'down':
                    if (this.placedEntities[index].position + this.totalColumns < this.totalRows * this.totalColumns) {
                        this.placedEntities[index].position += this.totalColumns;
                    }
                    break;
                case 'left':
                    if (this.placedEntities[index].position % this.totalColumns !== 0) {
                        this.placedEntities[index].position -= 1;
                    }
                    break;
                case 'right':
                    if (this.placedEntities[index].position % this.totalColumns !== this.totalColumns - 1) {
                        this.placedEntities[index].position += 1;
                    }
                    break;
            }
        },

        predictNextPosition(placedEntity) {
            let nextPosition = placedEntity.position;

            switch (placedEntity.direction) {
                case 'up': nextPosition -= this.totalColumns; break;
                case 'down': nextPosition += this.totalColumns; break;
                case 'left': nextPosition -= 1; break;
                case 'right': nextPosition += 1; break;
            }

            return nextPosition;
        },

        checkCollisions(entityIndex, placedEntities) {
            for (let index = 0; index < placedEntities.length; index++) {
                if (index === entityIndex) continue;
                if (placedEntities[index].position === placedEntities[entityIndex].position) return false;
            }

            return true;
        },

        detectCollisionsWithAv(entityIndex, placedEntities) {
            const assumedNextPosition = this.predictNextPosition(placedEntities[entityIndex]);

            const avEntity = placedEntities[placedEntities.length - 1];

            if (avEntity.position === assumedNextPosition) return true;

            return false;
        },

        predictCollisions(entityIndex, placedEntities) {
            // Get the predicted next position of the current entity
            const assumedNextPosition = this.predictNextPosition(placedEntities[entityIndex]);
            const currentEntity = placedEntities[entityIndex];
            const currentEntitySpeed = this.entities[currentEntity.entityId].speed;

            // Loop through all placed entities to check for potential collisions
            for (let index = 0; index < placedEntities.length; index++) {
                // Skip the current entity itself
                if (entityIndex === index) continue;

                // Get the entity being checked and predict its next position
                const entity = placedEntities[index];
                entity.predictedNextPosition = this.predictNextPosition(entity);
                const otherEntitySpeed = this.entities[entity.entityId].speed;

                // Calculate the time it would take for both entities to reach their next positions
                const timeToReachCurrentEntity = currentEntitySpeed > 0 ? currentEntity.speed : Infinity;
                const timeToReachOtherEntity = otherEntitySpeed > 0 ? otherEntitySpeed : Infinity;

                // Check if the other entity is currently at the assumed next position
                if (entity.position === assumedNextPosition) {
                    console.log('About to collide at ', assumedNextPosition);
                    toast.warning(`A Collision about to happen at ${assumedNextPosition}`);
                    console.log(this.specifyCollisionType(currentEntity, placedEntities));
                    return; // Exit the function if a collision is imminent
                }

                // Check for potential collision based on predicted next positions and their respective speeds
                if ((entity.predictedNextPosition === assumedNextPosition) && (timeToReachCurrentEntity === timeToReachOtherEntity)) {
                    console.log(`Predicted collision at ${entity.predictedNextPosition}, next position of ${entity.entityId}`);
                    toast.info(`Predicted a potential collision at ${assumedNextPosition}`);
                    return; // Exit the function if a potential collision is detected
                }
            }
        },

        specifyCollisionType(mainEntity, placedEntities, direction) {
            const avPosition = mainEntity.position;
            const totalCols = this.totalColumns;
            const totalRows = this.totalRows;
        
            // Neighboring cells (same as before)
            const top = avPosition - totalCols;
            const bottom = avPosition + totalCols;
            const left = avPosition - 1;
            const right = avPosition + 1;
            const topRight = avPosition - totalCols + 1;
            const bottomRight = avPosition + totalCols + 1;
        
            const isLeftEdge = avPosition % totalCols === 0;
            const isRightEdge = avPosition % totalCols === totalCols - 1;
            const isTopEdge = avPosition < totalCols;
            const isBottomEdge = avPosition >= totalCols * (totalRows - 1);
        
            // Possible moves based on direction (no backward moves)
            let possibleMoves = [];
            if (direction === 'right') {
                possibleMoves = [
                    { pos: top, priority: 2, valid: !isTopEdge },
                    { pos: bottom, priority: 3, valid: !isBottomEdge },
                    { pos: right, priority: 1, valid: !isRightEdge },
                    { pos: topRight, priority: 1, valid: !isTopEdge && !isRightEdge },
                    { pos: bottomRight, priority: 1, valid: !isBottomEdge && !isRightEdge }
                ];
            } else if (direction === 'up') {
                possibleMoves = [
                    { pos: left, priority: 3, valid: !isLeftEdge },
                    { pos: right, priority: 2, valid: !isRightEdge },
                    { pos: top, priority: 1, valid: !isTopEdge }
                ];
            } else if (direction === 'down') {
                possibleMoves = [
                    { pos: left, priority: 3, valid: !isLeftEdge },
                    { pos: right, priority: 2, valid: !isRightEdge },
                    { pos: bottom, priority: 1, valid: !isBottomEdge }
                ];
            }
        
            // Filter valid moves and sort by priority
            possibleMoves = possibleMoves
                .filter(cell => cell.valid)
                .sort((a, b) => a.priority - b.priority);
        
            // Check if cells are occupied
            const blockedCells = placedEntities.map(e => e.position);
            const availableMoves = possibleMoves.filter(pos => !blockedCells.includes(pos.pos));
        
            if (availableMoves.length > 0) {
                // Return the best avoidable move (lowest priority number)
                return {
                    'status': 'avoidable',
                    'suggestedPosition': availableMoves[0].pos
                };
            } else {
                // All cells blocked – unavoidable
                return {
                    'status': 'unavoidable'
                };
            }
        }
        
        
        
        
    }
})