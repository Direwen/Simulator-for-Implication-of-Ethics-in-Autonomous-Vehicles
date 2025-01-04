import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {

    state: () => {
        return {
            entities: {
                "entity-pedestrain" : {
                    id: "entity-pedestrain",
                    name: "pedestrain",
                    content: "🚶"
                },
                "entity-cyclist" : {
                    id: "entity-cyclist",
                    name: "cyclist",
                    content: "🚴"
                },
            },
            placedEntities: [],
            totalColumns: 5,
            totalRows: 10,
        }
    },

    actions: {
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
        moveEntities() {
            const moveInterval = setInterval(() => {
                let allEntitiesAtEdge = true; // To check if all entities are at their edges
        
                this.placedEntities.forEach(entity => {
                    // Move the entity based on its direction
                    switch (entity.direction) {
                        case 'up':
                            if (entity.position - this.totalColumns >= 0) {
                                entity.position -= this.totalColumns;
                            }
                            break;
                        case 'down':
                            if (entity.position + this.totalColumns < this.totalRows * this.totalColumns) {
                                entity.position += this.totalColumns;
                            }
                            break;
                        case 'left':
                            if (entity.position - 1 >= 0 && (entity.position % this.totalColumns !== 0)) {
                                entity.position -= 1;
                            }
                            break;
                        case 'right':
                            if (entity.position + 1 < this.totalRows * this.totalColumns && (entity.position % this.totalColumns !== this.totalColumns - 1)) {
                                entity.position += 1;
                            }
                            break;
                    }
        
                    // Check if any entity has not yet reached the edge
                    if ((entity.direction === 'up' && entity.position > 0) ||
                        (entity.direction === 'down' && entity.position < this.totalRows * this.totalColumns - this.totalColumns) ||
                        (entity.direction === 'left' && entity.position % this.totalColumns !== 0) ||
                        (entity.direction === 'right' && entity.position % this.totalColumns !== this.totalColumns - 1)) {
                        allEntitiesAtEdge = false; // There's still an entity that needs to move
                    }
                });
        
                // If all entities are at the edge, stop the interval
                if (allEntitiesAtEdge) {
                    clearInterval(moveInterval);
                }
            }, 150); // Update every 100 milliseconds (adjust to your preference)
        },
        
        removeEntity(cellIndex) {
            this.placedEntities = this.placedEntities.filter(e => e.position !== cellIndex);
        }
        
    }
})