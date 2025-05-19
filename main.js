// DOM Elements
const signupContainer = document.getElementById('signup-container');
const loginContainer = document.getElementById('login-container');
const todoContainer = document.getElementById('todo-container');
const userEmailElement = document.getElementById('user-email');
const todoList = document.getElementById('todo-list');
const newTodoInput = document.getElementById('new-todo');
const todoDescription = document.getElementById('todo-description');
const todoDueDate = document.getElementById('todo-due-date');
const todoPriority = document.getElementById('todo-priority');
const todoCategory = document.getElementById('todo-category');

// Current filter
let currentFilter = 'all';

// Check if user is logged in
window.onload = () => {
    const session = localStorage.getItem('session');
    if (session) {
        showTodoContainer();
        loadTodos();
    }
};

// Auth Functions
function showLogin() {
    signupContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    todoContainer.classList.add('hidden');
}

function showSignUp() {
    signupContainer.classList.remove('hidden');
    loginContainer.classList.add('hidden');
    todoContainer.classList.add('hidden');
}

function showTodoContainer() {
    signupContainer.classList.add('hidden');
    loginContainer.classList.add('hidden');
    todoContainer.classList.remove('hidden');
    const userEmail = localStorage.getItem('session');
    userEmailElement.textContent = userEmail;
}

function signUp() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!email || !password) {
        document.getElementById('signup-message').textContent = 'Please fill in all fields.';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.email === email)) {
        document.getElementById('signup-message').textContent = 'Email already exists.';
        return;
    }

    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem(`todos_${email}`, JSON.stringify([]));
    
    document.getElementById('signup-message').textContent = 'Account created! Please log in.';
    document.getElementById('signup-message').style.color = 'green';
    setTimeout(showLogin, 1500);
}

function logIn() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('session', email);
        showTodoContainer();
        loadTodos();
    } else {
        document.getElementById('login-message').textContent = 'Invalid credentials.';
    }
}

function logOut() {
    localStorage.removeItem('session');
    showLogin();
}

// Todo Functions
function loadTodos() {
    const userEmail = localStorage.getItem('session');
    const todos = JSON.parse(localStorage.getItem(`todos_${userEmail}`) || '[]');
    renderTodos(todos);
}

function saveTodos(todos) {
    const userEmail = localStorage.getItem('session');
    localStorage.setItem(`todos_${userEmail}`, JSON.stringify(todos));
}

function addTodo() {
    const title = newTodoInput.value.trim();
    const description = todoDescription.value.trim();
    const dueDate = todoDueDate.value;
    const priority = todoPriority.value;
    const category = todoCategory.value;

    if (!title) return;

    const userEmail = localStorage.getItem('session');
    const todos = JSON.parse(localStorage.getItem(`todos_${userEmail}`) || '[]');
    
    todos.push({
        id: Date.now(),
        title,
        description,
        dueDate,
        priority,
        category,
        completed: false,
        createdAt: new Date().toISOString()
    });

    saveTodos(todos);
    
    // Reset form
    newTodoInput.value = '';
    todoDescription.value = '';
    todoDueDate.value = '';
    todoPriority.value = 'low';
    todoCategory.value = 'personal';
    
    renderTodos(todos);
}

function toggleTodo(id) {
    const userEmail = localStorage.getItem('session');
    const todos = JSON.parse(localStorage.getItem(`todos_${userEmail}`) || '[]');
    
    const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    saveTodos(updatedTodos);
    renderTodos(updatedTodos);
}

function deleteTodo(id) {
    const userEmail = localStorage.getItem('session');
    const todos = JSON.parse(localStorage.getItem(`todos_${userEmail}`) || '[]');
    
    const updatedTodos = todos.filter(todo => todo.id !== id);
    
    saveTodos(updatedTodos);
    renderTodos(updatedTodos);
}

function filterTodos(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === filter) {
            btn.classList.add('active');
        }
    });

    loadTodos();
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function renderTodos(todos) {
    // Apply filter
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-item-header">
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                />
                <div class="todo-content">
                    <div class="todo-title">${todo.title}</div>
                    ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                    <div class="todo-meta">
                        ${todo.dueDate ? `<span>Due: ${formatDate(todo.dueDate)}</span>` : ''}
                        <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                        <span>${todo.category}</span>
                    </div>
                </div>
                <button onclick="deleteTodo(${todo.id})" class="delete-btn">Delete</button>
            </div>
        </li>
    `).join('');
}

// Event Listeners
newTodoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});