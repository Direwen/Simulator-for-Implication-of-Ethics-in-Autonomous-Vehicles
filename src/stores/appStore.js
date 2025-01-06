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
            maxEntities: 5,
            stuckCounter: 0,   // New counter for intervals with no movement
            maxStuckIntervals: 5,  // Number of intervals to wait before stopping
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
        
                this.placedEntities.forEach(entity => {
                    const prevPosition = entity.position;
                    if (entity.entityId == 'entity-av') this.moveAvEntity(entity, this.placedEntities);
                    else this.moveGenericEntity(entity);
                    if (entity.position !== prevPosition) {
                        anyEntityMoved = true;
                    }
                });
        
                // Reset stuck counter if any entity moves
                if (anyEntityMoved) this.stuckCounter = 0; 
                else this.stuckCounter++;
                
                // Stop play mode if no movement for multiple intervals
                if (this.stuckCounter >= this.maxStuckIntervals) {
                    this.stopPlayMode();
                    clearInterval(moveInterval);  // Stop the interval properly
                }

                // Stop play mode of an collision occured
                const avCollisionPosition = this.detectAvCollisions(this.placedEntities);
                if (avCollisionPosition >= 0) {
                    toast.error(`A Collision occured at ${avCollisionPosition}`)
                    this.stopPlayMode();
                    clearInterval(moveInterval);  // Stop the interval properly
                }

            }, 50);
        },

        moveGenericEntity(placedEntity) {
            const entityDetails = this.entities[placedEntity.entityId];
            if (this.istimeToMove(placedEntity, entityDetails)) {
                this.updatePosition(placedEntity);
                placedEntity.lastMoveTime = Date.now();  // Update the placed entity's movement time
            }
        },
        
        moveAvEntity(placedEntity, placedEntities) {
            const entityDetails = this.entities[placedEntity.entityId];
            if (this.istimeToMove(placedEntity, entityDetails)) {
                // Predict Potential Collisions
                this.predictCollisions(placedEntity, placedEntities);
                //Avoid if possible
                // If unavoidable, stop (skip the turn to move)
                // If not stopptable, 
                this.updatePosition(placedEntity);
                placedEntity.lastMoveTime = Date.now();  // Update the placed entity's movement time
            }
        },
        
        istimeToMove(placedEntity, entityDetails) {
            return !placedEntity.lastMoveTime || Date.now() - placedEntity.lastMoveTime >= entityDetails.speed;
        },

        updatePosition(placedEntity) {
            switch (placedEntity.direction) {
                case 'up':
                    if (placedEntity.position - this.totalColumns >= 0) {
                        placedEntity.position -= this.totalColumns;
                    }
                    break;
                case 'down':
                    if (placedEntity.position + this.totalColumns < this.totalRows * this.totalColumns) {
                        placedEntity.position += this.totalColumns;
                    }
                    break;
                case 'left':
                    if (placedEntity.position % this.totalColumns !== 0) {
                        placedEntity.position -= 1;
                    }
                    break;
                case 'right':
                    if (placedEntity.position % this.totalColumns !== this.totalColumns - 1) {
                        placedEntity.position += 1;
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

        detectAvCollisions(placedEntities) {
            const avPosition = placedEntities[placedEntities.length - 1].position;

            for (const entity of placedEntities) {
                if (entity.entityId != 'entity-av') {
                    if (entity.position == avPosition) return avPosition; 
                }
            }

            return -1;  // Return -1 if no collision is detected
        },

        predictCollisions(mainEntity, placedEntities) {
            const filteredEntities = placedEntities.filter(entity => entity.entityId != mainEntity.entityId);
            filteredEntities.forEach(entity => {
                
            })
        },
        
    }
})