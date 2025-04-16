// Familienmitglieder
const familyMembers = [
    { id: 'mama', name: 'Mama', color: '#A3D9FF', avatar: '👩' },
    { id: 'papa', name: 'Papa', color: '#FFE156', avatar: '👨' },
    { id: 'kind', name: 'Kind', color: '#B8EECA', avatar: '🧒' }
];

// Beispiel-Aufgaben
let tasks = [
    {
        id: 1,
        title: 'Zimmer aufräumen',
        description: 'Bitte vor dem Abendessen das Zimmer ordentlich aufräumen.',
        completed: false,
        assignedTo: 'kind',
        dueDate: getFormattedDate(new Date()),
        createdAt: getCurrentTime()
    },
    {
        id: 2,
        title: 'Hausaufgaben machen',
        description: 'Mathe-Übungen auf Seite 42-43 lösen.',
        completed: true,
        assignedTo: 'kind',
        dueDate: getFormattedDate(new Date()),
        createdAt: '09:30'
    },
    {
        id: 3,
        title: 'Einkaufsliste vorbereiten',
        description: 'Notiere was wir für das Wochenende brauchen.',
        completed: false,
        assignedTo: 'mama',
        dueDate: getFormattedDate(new Date(new Date().setDate(new Date().getDate() + 1))),
        createdAt: '11:15'
    }
];

// Beispiel-Termine
let events = [
    {
        id: 1,
        title: 'Einkaufen',
        date: getFormattedDate(new Date()),
        time: '15:00',
        participants: ['mama', 'kind']
    },
    {
        id: 2,
        title: 'Hausaufgaben',
        date: getFormattedDate(new Date()),
        time: '16:30',
        participants: ['kind']
    },
    {
        id: 3,
        title: 'Schule',
        date: getFormattedDate(new Date(new Date().setDate(new Date().getDate() + 1))),
        time: '08:00',
        participants: ['kind']
    },
    {
        id: 4,
        title: 'Sport',
        date: getFormattedDate(new Date(new Date().setDate(new Date().getDate() + 1))),
        time: '15:30',
        participants: ['kind', 'papa']
    }
];

// Beispiel-Nachrichten
let messages = [
    {
        id: 1,
        sender: 'mama',
        content: 'Denk bitte daran, dass wir heute Abend Besuch bekommen.',
        time: '10:30',
        read: true
    },
    {
        id: 2,
        sender: 'papa',
        content: 'Ich habe die Bücher für das Schulprojekt gekauft.',
        time: '09:15',
        read: true
    },
    {
        id: 3,
        sender: 'kind',
        content: 'Kann ich heute Abend länger aufbleiben?',
        time: '18:45',
        read: false
    }
];

// Aktueller Benutzer
let currentUser = null;

// Modal State
let isEditingTask = false;
let currentTaskId = null;
let taskToDelete = null;

// DOM-Elemente
const loginContainer = document.getElementById('loginContainer');
const appContent = document.getElementById('appContent');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const todoList = document.getElementById('todoList');
const fullTodoList = document.getElementById('fullTodoList');
const calendarContent = document.getElementById('calendarContent');
const fullCalendarContent = document.getElementById('fullCalendarContent');
const messagesContent = document.getElementById('messagesContent');
const fullMessagesContent = document.getElementById('fullMessagesContent');
const addTaskBtn = document.getElementById('addTaskBtn');
const addTaskBtnFull = document.getElementById('addTaskBtnFull');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const taskForm = document.getElementById('taskForm');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');
const confirmDialog = document.getElementById('confirmDialog');
const confirmMessage = document.getElementById('confirmMessage');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const feedbackMessage = document.getElementById('feedbackMessage');
const modalTitle = document.getElementById('modalTitle');
const adminLink = document.getElementById('adminLink');
const navItems = document.querySelectorAll('.nav-item');
const dashboardSection = document.getElementById('dashboardSection');
const todoSection = document.getElementById('todoSection');
const calendarSection = document.getElementById('calendarSection');
const messagesSection = document.getElementById('messagesSection');

// Initialisierung
function initialize() {
    // Event Listener
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    addTaskBtn.addEventListener('click', () => openTaskModal(false));
    addTaskBtnFull.addEventListener('click', () => openTaskModal(false));
    closeModal.addEventListener('click', closeTaskModal);
    cancelTaskBtn.addEventListener('click', closeTaskModal);
    saveTaskBtn.addEventListener('click', saveTask);
    cancelDeleteBtn.addEventListener('click', closeConfirmDialog);
    confirmDeleteBtn.addEventListener('click', deleteConfirmedTask);

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavigation(item.dataset.section);
        });
    });

    // Wenn Modal außerhalb geklickt wird, schließen
    window.addEventListener('click', function(event) {
        if (event.target === taskModal) {
            closeTaskModal();
        }
        if (event.target === confirmDialog) {
            closeConfirmDialog();
        }
    });

    // Enter-Taste im Login-Formular
    loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
}

// Login-Handler
function handleLogin(event) {
    event.preventDefault(); // Verhindert das Standardverhalten

    const formData = new FormData(loginForm);

    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = {
                id: data.id || 'user',
                name: data.name || 'Benutzer',
                avatar: '👤',
                color: getRandomColor(),
                isAdmin: data.is_admin || false
            };

            // UI aktualisieren
            userName.textContent = currentUser.name;
            userAvatar.textContent = currentUser.avatar;
            userAvatar.style.backgroundColor = currentUser.color;

            if (currentUser.isAdmin) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }

            loginContainer.style.display = 'none';
            appContent.style.display = 'block';
            renderAllData();
            showFeedback(`Willkommen zurück, ${currentUser.name}!`);
        } else {
            alert(data.message || 'Anmeldung fehlgeschlagen.');
        }
    })
    .catch(err => {
        console.error('Login-Fehler:', err);
        alert('Fehler beim Login.');
    });
}

// Logout-Handler
function handleLogout() {
    currentUser = null;
    appContent.style.display = 'none';
    loginContainer.style.display = 'flex';
    usernameInput.value = '';
    passwordInput.value = '';
}

// Navigation-Handler
function handleNavigation(section) {
    // Navigation aktualisieren
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });

    // Sektionen anzeigen/verstecken
    dashboardSection.style.display = section === 'dashboard' ? 'block' : 'none';
    todoSection.style.display = section === 'todo' ? 'block' : 'none';
    calendarSection.style.display = section === 'calendar' ? 'block' : 'none';
    messagesSection.style.display = section === 'messages' ? 'block' : 'none';

    // Daten für die aktive Sektion rendern
    switch(section) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'todo':
            renderFullTodoList();
            break;
        case 'calendar':
            renderFullCalendar();
            break;
        case 'messages':
            renderFullMessages();
            break;
    }
}

// Alle Daten rendern
function renderAllData() {
    renderDashboard();
    renderFullTodoList();
    renderFullCalendar();
    renderFullMessages();
}

// Dashboard rendern
function renderDashboard() {
    renderTasks();
    renderCalendarOverview();
    renderMessagesOverview();
}

// Aufgaben rendern (für Dashboard)
function renderTasks() {
    todoList.innerHTML = '';

    const uncompletedTasks = tasks.filter(task => !task.completed).slice(0, 5);

    if (uncompletedTasks.length === 0) {
        todoList.innerHTML = '<li class="empty-state"><p>Keine offenen Aufgaben. Super gemacht! 🎉</p></li>';
        return;
    }

    uncompletedTasks.forEach(task => {
        const li = createTaskElement(task);
        todoList.appendChild(li);
    });
}

// Vollständige Aufgabenliste rendern
function renderFullTodoList() {
    fullTodoList.innerHTML = '';

    if (tasks.length === 0) {
        fullTodoList.innerHTML = '<li class="empty-state"><p>Keine Aufgaben vorhanden.</p></li>';
        return;
    }

    // Nach Status und Fälligkeitsdatum sortieren
    tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
        return 0;
    });

    tasks.forEach(task => {
        const li = createTaskElement(task);
        fullTodoList.appendChild(li);
    });
}

// Kalender-Übersicht rendern (für Dashboard)
function renderCalendarOverview() {
    calendarContent.innerHTML = '';

    // Heutige und morgige Termine filtern
    const today = getFormattedDate(new Date());
    const tomorrow = getFormattedDate(new Date(new Date().setDate(new Date().getDate() + 1)));

    const todayEvents = events.filter(event => event.date === today);
    const tomorrowEvents = events.filter(event => event.date === tomorrow);

    if (todayEvents.length === 0 && tomorrowEvents.length === 0) {
        calendarContent.innerHTML = '<div class="empty-state"><p>Keine bevorstehenden Termine.</p></div>';
        return;
    }

    // Heutige Termine
    if (todayEvents.length > 0) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = 'Heute';
        dayDiv.appendChild(dayHeader);

        todayEvents.forEach(event => {
            dayDiv.appendChild(createEventElement(event));
        });

        calendarContent.appendChild(dayDiv);
    }

    // Morgige Termine
    if (tomorrowEvents.length > 0) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = 'Morgen';
        dayDiv.appendChild(dayHeader);

        tomorrowEvents.forEach(event => {
            dayDiv.appendChild(createEventElement(event));
        });

        calendarContent.appendChild(dayDiv);
    }
}

// Vollständigen Kalender rendern
function renderFullCalendar() {
    fullCalendarContent.innerHTML = '';

    if (events.length === 0) {
        fullCalendarContent.innerHTML = '<div class="empty-state"><p>Keine Termine vorhanden.</p></div>';
        return;
    }

    // Termine nach Datum gruppieren
    const eventsByDate = {};
    events.forEach(event => {
        if (!eventsByDate[event.date]) {
            eventsByDate[event.date] = [];
        }
        eventsByDate[event.date].push(event);
    });

    // Sortierte Datumsliste erstellen
    const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(a) - new Date(b));

    // Kalendertage erstellen
    sortedDates.forEach(date => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';

        const dateObj = new Date(date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dayHeader.textContent = dateObj.toLocaleDateString('de-DE', options);
        dayDiv.appendChild(dayHeader);

        // Termine nach Uhrzeit sortieren
        eventsByDate[date].sort((a, b) => a.time.localeCompare(b.time));

        eventsByDate[date].forEach(event => {
            dayDiv.appendChild(createEventElement(event));
        });

        fullCalendarContent.appendChild(dayDiv);
    });
}

// Nachrichten-Übersicht rendern (für Dashboard)
function renderMessagesOverview() {
    messagesContent.innerHTML = '';

    // Letzten 2 Nachrichten anzeigen
    const recentMessages = [...messages]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 2);

    if (recentMessages.length === 0) {
        messagesContent.innerHTML = '<div class="empty-state"><p>Keine Nachrichten vorhanden.</p></div>';
        return;
    }

    recentMessages.forEach(message => {
        messagesContent.appendChild(createMessageElement(message));
    });
}

// Vollständige Nachrichten rendern
function renderFullMessages() {
    fullMessagesContent.innerHTML = '';

    if (messages.length === 0) {
        fullMessagesContent.innerHTML = '<div class="empty-state"><p>Keine Nachrichten vorhanden.</p></div>';
        return;
    }

    // Nachrichten nach Zeit sortieren (neueste zuerst)
    const sortedMessages = [...messages].sort((a, b) => new Date(b.time) - new Date(a.time));

    sortedMessages.forEach(message => {
        fullMessagesContent.appendChild(createMessageElement(message));
    });
}

// Aufgaben-Element erstellen
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

    const content = document.createElement('div');
    content.className = 'todo-content';

    const title = document.createElement('h4');
    title.className = 'todo-title';
    title.textContent = task.title;

    const description = document.createElement('p');
    description.className = 'todo-description';
    description.textContent = task.description;

    const meta = document.createElement('div');
    meta.className = 'todo-meta';

    const assignedTo = document.createElement('div');
    assignedTo.className = 'assigned-to';

    const member = familyMembers.find(m => m.id === task.assignedTo) ||
                  { id: task.assignedTo, name: task.assignedTo, color: getRandomColor(), avatar: '👤' };

    const miniAvatar = document.createElement('div');
    miniAvatar.className = 'mini-avatar';
    miniAvatar.textContent = member.avatar;
    miniAvatar.style.backgroundColor = member.color;

    const assignedName = document.createElement('span');
    assignedName.textContent = member.name;

    const dueDate = document.createElement('span');
    if (task.dueDate) {
        const dueDateObj = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDateObj < today && !task.completed) {
            dueDate.style.color = 'var(--danger)';
            dueDate.textContent = ` (überfällig: ${dueDateObj.toLocaleDateString('de-DE')})`;
        } else if (task.dueDate) {
            dueDate.textContent = ` (fällig: ${dueDateObj.toLocaleDateString('de-DE')})`;
        }
    }

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Bearbeiten-Button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Bearbeiten';
    editBtn.addEventListener('click', () => openTaskModal(true, task.id));
    actions.appendChild(editBtn);

    // Löschen-Button (nur für Admin oder eigene Aufgaben)
    if (currentUser.isAdmin || task.assignedTo === currentUser.id) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Löschen';
        deleteBtn.addEventListener('click', () => confirmDelete(task.id));
        actions.appendChild(deleteBtn);
    }

    // Zusammensetzen
    assignedTo.appendChild(miniAvatar);
    assignedTo.appendChild(assignedName);
    assignedTo.appendChild(dueDate);

    meta.appendChild(assignedTo);
    meta.appendChild(actions);

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(meta);

    li.appendChild(checkbox);
    li.appendChild(content);

    return li;
}

// Termin-Element erstellen
function createEventElement(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'day-event';

    const eventTitle = document.createElement('span');
    eventTitle.textContent = event.title;

    const eventTime = document.createElement('span');
    eventTime.className = 'event-time';
    eventTime.textContent = event.time;

    const participants = document.createElement('div');
    participants.className = 'event-participants';

    event.participants.forEach(participantId => {
        const member = familyMembers.find(m => m.id === participantId);
        if (member) {
            const avatar = document.createElement('span');
            avatar.className = 'mini-avatar';
            avatar.textContent = member.avatar;
            avatar.style.backgroundColor = member.color;
            avatar.title = member.name;
            participants.appendChild(avatar);
        }
    });

    eventDiv.appendChild(eventTitle);
    eventDiv.appendChild(eventTime);
    eventDiv.appendChild(participants);

    return eventDiv;
}

// Nachrichten-Element erstellen
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    if (!message.read && message.sender !== currentUser.id) {
        messageDiv.style.backgroundColor = 'rgba(163, 217, 255, 0.2)';
    }

    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';

    const sender = familyMembers.find(m => m.id === message.sender) ||
                 { id: message.sender, name: message.sender, color: getRandomColor(), avatar: '👤' };

    const avatar = document.createElement('div');
    avatar.className = 'mini-avatar';
    avatar.textContent = sender.avatar;
    avatar.style.backgroundColor = sender.color;

    const senderName = document.createElement('div');
    senderName.className = 'message-sender';
    senderName.textContent = sender.name;

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = message.time;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message.content;

    messageHeader.appendChild(avatar);
    messageHeader.appendChild(senderName);
    messageHeader.appendChild(messageTime);

    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageContent);

    // Nachricht als gelesen markieren
    if (!message.read && message.sender !== currentUser.id) {
        message.read = true;
    }

    return messageDiv;
}

// Aufgabenstatus umschalten
function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: !task.completed
            })
        })
        .then(response => response.json())
        .then(data => {
            loadTasks();
            if (data.completed) {
                showFeedback('Aufgabe erledigt! 👍');
            }
        })
        .catch(error => {
            console.error('Fehler beim Aktualisieren des Status:', error);
            showFeedback('Fehler beim Aktualisieren des Status.');
        });
    }
}

// Aufgaben-Modal öffnen
function openTaskModal(editing, taskId = null) {
    // Modal zurücksetzen
    taskForm.reset();
    document.getElementById('assignedTo').value = 'me';
    document.getElementById('taskDueDate').value = '';

    if (editing && taskId) {
        // Bearbeitungsmodus
        isEditingTask = true;
        currentTaskId = taskId;
        modalTitle.textContent = 'Aufgabe bearbeiten';

        // Aufgabe finden und Formular füllen
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('assignedTo').value = task.assignedTo === currentUser.id ? 'me' : task.assignedTo;
            if (task.dueDate) {
                document.getElementById('taskDueDate').value = task.dueDate;
            }
        }
    } else {
        // Neuerstellungsmodus
        isEditingTask = false;
        currentTaskId = null;
        modalTitle.textContent = 'Neue Aufgabe hinzufügen';
    }

    // Modal anzeigen
    taskModal.classList.add('show');
}

// Aufgaben-Modal schließen
function closeTaskModal() {
    taskModal.classList.remove('show');
    isEditingTask = false;
    currentTaskId = null;
}

// Aufgabe speichern
function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;

    if (!title) {
        alert('Bitte gib einen Titel ein.');
        return;
    }

    const taskData = {
        title: title,
        description: description,
        due_date: dueDate || null
    };

    if (isEditingTask && currentTaskId) {
        // Aufgabe bearbeiten
        fetch(`/api/tasks/${currentTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showFeedback('Aufgabe erfolgreich aktualisiert!');
            loadTasks();
        })
        .catch(error => {
            console.error('Fehler beim Aktualisieren der Aufgabe:', error);
            showFeedback('Fehler beim Aktualisieren der Aufgabe.');
        });
    } else {
        // Neue Aufgabe erstellen
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showFeedback('Neue Aufgabe hinzugefügt!');
            loadTasks();
        })
        .catch(error => {
            console.error('Fehler beim Erstellen der Aufgabe:', error);
            showFeedback('Fehler beim Erstellen der Aufgabe.');
        });
    }

    closeTaskModal();
}

// Aufgaben laden
function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            // Dashboard-Ansicht aktualisieren
            if (todoList) {
                renderTasks(tasks);
            }
            // Vollständige Aufgabenliste aktualisieren
            if (fullTodoList) {
                renderFullTodoList(tasks);
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Aufgaben:', error);
            showFeedback('Fehler beim Laden der Aufgaben.');
        });
}

// Bestätigungsdialog für Löschen anzeigen
function confirmDelete(id) {
    taskToDelete = id;
    confirmMessage.textContent = 'Aufgabe wirklich löschen?';
    confirmDialog.classList.add('show');
}

// Bestätigungsdialog schließen
function closeConfirmDialog() {
    confirmDialog.classList.remove('show');
    taskToDelete = null;
}

// Bestätigte Aufgabe löschen
function deleteConfirmedTask() {
    if (taskToDelete !== null) {
        fetch(`/api/tasks/${taskToDelete}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            showFeedback('Aufgabe gelöscht.');
            loadTasks();
        })
        .catch(error => {
            console.error('Fehler beim Löschen der Aufgabe:', error);
            showFeedback('Fehler beim Löschen der Aufgabe.');
        });
        closeConfirmDialog();
    }
}

// Feedback-Nachricht anzeigen
function showFeedback(message) {
    feedbackMessage.textContent = message;
    feedbackMessage.classList.add('show');
    setTimeout(() => {
        feedbackMessage.classList.remove('show');
    }, 3000);
}

// Hilfsfunktion für aktuelles Datum (YYYY-MM-DD)
function getFormattedDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Hilfsfunktion für aktuelle Zeit (HH:MM)
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Zufällige Farbe generieren
function getRandomColor() {
    const colors = ['#A3D9FF', '#FFE156', '#B8EECA', '#FFB347', '#C7CEEA', '#FF9AA2'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    initialize();
    if (currentUser) {
        loadTasks();
    }
});