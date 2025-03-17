Vue.component('card-component', {
    props: ['card'],
    template: `
        <div class="card">
            <div class="card-view" v-if="!card.isEditing">
                <h3>{{ card.title }}</h3>
                <div class="card-block">
                <p>{{ card.description }}</p>
                <p><b>Создано:</b> {{ new Date(card.id).toLocaleString() }}</p>
                <p><b>Дэдлайн:</b> {{ card.deadline ? new Date(card.deadline).toLocaleString() : 'Нет' }}</p>
                <button @click="editCard">Редактировать</button>
                </div>
                
            </div>
            <div class="card-form" v-else>
                <input v-model="card.title" placeholder="Заголовок">
                <textarea v-model="card.description" placeholder="Описание"></textarea>
                <input type="datetime-local" v-model="card.deadline">
                <button @click="saveCard">Сохранить</button>
            </div>
        </div>
    `,
    methods: {
        editCard() {
            this.card.isEditing = true;
        },
        saveCard() {
            this.card.isEditing = false;
        }
    }
});

Vue.component('column-component', {
    props: ['column', 'column-index'],
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <button v-if="columnIndex === 0" @click="$emit('add-card', columnIndex)">Добавить карточку</button>
            <div class="cards">
                <card-component
                    v-for="(card, index) in column.cards"
                    :key="card.id"
                    :card="card"
                ></card-component>
            </div>
        </div>
    `
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
                deadline: null
            };
            this.columns[columnIndex].cards.push(newCard);
            this.saveToLocalStorage();
        },
        moveCard(cardId, fromColumnIndex, toColumnIndex) {
            const card = this.columns[fromColumnIndex].cards.find(c => c.id === cardId);
            this.columns[fromColumnIndex].cards = this.columns[fromColumnIndex].cards.filter(c => c.id !== cardId);
            this.columns[toColumnIndex].cards.push(card);
            this.saveToLocalStorage();
        },
        deleteCard(cardId,ColumnIndex){

        },
        saveToLocalStorage() {
            localStorage.setItem("columns", JSON.stringify(this.columns));
        }
    }
});