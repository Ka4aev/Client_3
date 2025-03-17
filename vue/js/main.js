Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    template: `
        <div class="card" draggable="true" @dragstart="onDragStart">
            <div class="card-view" v-if="!card.isEditing">
                <h3>{{ card.title }}</h3>
                <div class="card-block">
                    <p>{{ card.description }}</p>
                    <p><b>Создано:</b> {{ new Date(card.id).toLocaleString() }}</p>
                    <p><b>Последнее редактирование:</b> {{ card.lastEdited ? new Date(card.lastEdited).toLocaleString() : '' }}</p>
                    <p><b>Дэдлайн:</b> {{ card.deadline ? new Date(card.deadline).toLocaleString() : 'Нет' }}</p>
                    <button @click="editCard">Редактировать</button>
                    <button @click="$emit('delete-card', card.id, columnIndex)">Удалить</button>
                    <button v-if="columnIndex === 0" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: columnIndex, toColumnIndex: 1 })">В работу</button>
                </div>
            </div>
            <div class="card-form" v-else>
                <input v-model="card.title" placeholder="Заголовок" required>
                <textarea v-model="card.description" placeholder="Описание"></textarea>
                <input type="datetime-local" v-model="card.deadline">
                <button @click="saveCard">Сохранить</button>
                <p v-if="error" class="error">{{ error }}</p>
            </div>
        </div>
    `,
    data() {
        return {
            error: ''
        };
    },
    methods: {
        editCard() {
            this.card.isEditing = true;
            this.error = '';
        },
        saveCard() {
            if (!this.card.title.trim()) {
                this.error = 'Заголовок не может быть пустым';
                return;
            }
            this.card.isEditing = false;
            this.card.lastEdited = Date.now();
            this.$emit('update-card', this.card);
            this.error = '';
        },
        onDragStart(event) {
            event.dataTransfer.setData('cardId', this.card.id);
            event.dataTransfer.setData('fromColumnIndex', this.columnIndex);
        }
    }
});

Vue.component('column-component', {
    props: ['column', 'column-index'],
    template: `
       <div class="column" @dragover.prevent @dragenter.prevent @drop="onDrop">
    <h2>{{ column.title }}</h2>
    <button v-if="columnIndex === 0" @click="$emit('add-card', columnIndex)">Добавить карточку</button>
    <div class="cards">
        <card-component
            v-for="(card, index) in column.cards"
            :key="card.id"
            :card="card"
            :column-index="columnIndex"
            @delete-card="$emit('delete-card', $event, columnIndex)"
            @move-card="$emit('move-card', $event)"
            @update-card="updateCard"
        ></card-component>
    </div>
</div>
    `,
    methods: {
        updateCard(card) {
            this.$emit('update-card', card);
        },
        onDrop(event) {
            console.log(event)
            const cardId = event.dataTransfer.getData('cardId');
            const fromColumnIndex = event.dataTransfer.getData('fromColumnIndex');
            const toColumnIndex = this.columnIndex;

            if (fromColumnIndex !== toColumnIndex) {
                this.$emit('move-card', { cardId, fromColumnIndex, toColumnIndex });
            }
        }
    }
});

const app = new Vue({
    el: '#app',
    data() {
        return {
            columns: JSON.parse(localStorage.getItem("columns")) || [
                { title: "Запланированные задачи", cards: [] },
                { title: "Задачи в работе", cards: [] },
                { title: "Тестирование", cards: [] },
                { title: "Выполненные задачи", cards: [] }
            ]
        }
    },
    methods: {
        addCard(columnIndex) {
            const newCard = {
                id: Date.now(),
                title: '',
                description: '',
                completedAt: null,
                isEditing: true,
                deadline: null,
                lastEdited: null
            };
            this.columns[columnIndex].cards.push(newCard);
            this.saveToLocalStorage();
        },
        moveCard({ cardId, fromColumnIndex, toColumnIndex }) {
            fromColumnIndex = Number(fromColumnIndex);
            toColumnIndex = Number(toColumnIndex);

            cardId = Number(cardId);
            const card = this.columns[fromColumnIndex].cards.find(c => c.id === cardId);

            if (!card) {
                console.error("Card not found:", cardId);
                return;
            }

            this.columns[fromColumnIndex].cards = this.columns[fromColumnIndex].cards.filter(c => c.id !== cardId);
            this.columns[toColumnIndex].cards.push(card);

            this.saveToLocalStorage();
        },
        deleteCard(cardId, columnIndex) {
            this.columns[columnIndex].cards = this.columns[columnIndex].cards.filter(c => c.id !== cardId);
            this.saveToLocalStorage();
        },
        updateCard(card) {
            for (let column of this.columns) {
                const foundCard = column.cards.find(c => c.id === card.id);
                if (foundCard) {
                    Object.assign(foundCard, card);
                    break;
                }
            }
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem("columns", JSON.stringify(this.columns));
        }
    }
});