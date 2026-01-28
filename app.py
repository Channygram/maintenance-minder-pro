#!/usr/bin/env python3
"""
Maintenance Minder Pro
Track maintenance for your vehicles, home, and appliances.
"""

import streamlit as st
import json
from datetime import datetime, timedelta
from pathlib import Path
import uuid

st.set_page_config(
    page_title="Maintenance Minder Pro",
    page_icon="⚙️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================
# PROFESSIONAL CSS - CLEAN DARK THEME
# ============================================
st.markdown("""
<style>
    /* Main background */
    .stApp {
        background: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);
    }
    
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background: #0d0d12;
        border-right: 1px solid #1a1a24;
    }
    
    /* Cards */
    .card {
        background: linear-gradient(145deg, #13131a 0%, #0d0d12 100%);
        border: 1px solid #1f1f2e;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 16px;
        transition: all 0.2s ease;
    }
    .card:hover {
        border-color: #3b3b5c;
        transform: translateY(-2px);
    }
    
    /* Stat cards */
    .stat-card {
        background: linear-gradient(145deg, #13131a 0%, #0d0d12 100%);
        border: 1px solid #1f1f2e;
        border-radius: 12px;
        padding: 20px 24px;
        text-align: center;
    }
    .stat-value {
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.2;
    }
    .stat-label {
        font-size: 13px;
        color: #6b6b80;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 8px;
    }
    
    /* Status indicators */
    .status-overdue {
        color: #ef4444;
        font-weight: 600;
    }
    .status-soon {
        color: #f59e0b;
        font-weight: 600;
    }
    .status-ok {
        color: #10b981;
        font-weight: 600;
    }
    
    /* Priority indicators */
    .priority-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
    }
    .priority-critical { background: #ef4444; }
    .priority-high { background: #f97316; }
    .priority-medium { background: #f59e0b; }
    .priority-low { background: #10b981; }
    
    /* Task items */
    .task-item {
        background: #13131a;
        border: 1px solid #1f1f2e;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .task-item.overdue {
        border-left: 3px solid #ef4444;
    }
    .task-item.due-soon {
        border-left: 3px solid #f59e0b;
    }
    
    /* Section headers */
    .section-header {
        font-size: 14px;
        font-weight: 600;
        color: #6b6b80;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #1f1f2e;
    }
    
    /* Item type badges */
    .type-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .type-vehicle { background: #1e3a5f; color: #60a5fa; }
    .type-home { background: #1e3a3a; color: #34d399; }
    .type-appliance { background: #3a1e3a; color: #c084fc; }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    .stButton > button:hover {
        background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
        transform: translateY(-1px);
    }
    
    /* Form inputs */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea,
    .stSelectbox > div > div > div {
        background: #13131a !important;
        border: 1px solid #1f1f2e !important;
        border-radius: 8px !important;
        color: #ffffff !important;
    }
    
    /* Page title */
    .page-title {
        font-size: 28px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 8px;
    }
    .page-subtitle {
        font-size: 14px;
        color: #6b6b80;
        margin-bottom: 32px;
    }
    
    /* Empty state */
    .empty-state {
        text-align: center;
        padding: 60px 40px;
        background: #13131a;
        border: 1px dashed #2a2a3c;
        border-radius: 12px;
    }
    .empty-state h3 {
        color: #ffffff;
        margin-bottom: 8px;
    }
    .empty-state p {
        color: #6b6b80;
    }
</style>
""", unsafe_allow_html=True)

# ============================================
# DATA STORAGE
# ============================================
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
ITEMS_FILE = DATA_DIR / "items.json"
TASKS_FILE = DATA_DIR / "tasks.json"
LOGS_FILE = DATA_DIR / "logs.json"

def load_json(file_path, default=None):
    if file_path.exists():
        return json.load(open(file_path))
    return default if default is not None else []

def save_json(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2, default=str)

def load_items(): return load_json(ITEMS_FILE, [])
def save_items(items): save_json(ITEMS_FILE, items)
def load_tasks(): return load_json(TASKS_FILE, [])
def save_tasks(tasks): save_json(TASKS_FILE, tasks)
def load_logs(): return load_json(LOGS_FILE, [])
def save_logs(logs): save_json(LOGS_FILE, logs)

# ============================================
# MAINTENANCE TEMPLATES
# ============================================
TEMPLATES = {
    "vehicle": [
        {"name": "Oil Change", "interval_days": 90, "priority": "high"},
        {"name": "Tire Rotation", "interval_days": 180, "priority": "medium"},
        {"name": "Air Filter Replacement", "interval_days": 365, "priority": "low"},
        {"name": "Brake Inspection", "interval_days": 365, "priority": "high"},
        {"name": "Battery Check", "interval_days": 365, "priority": "medium"},
    ],
    "home": [
        {"name": "HVAC Filter Change", "interval_days": 90, "priority": "high"},
        {"name": "Smoke Detector Test", "interval_days": 180, "priority": "critical"},
        {"name": "Gutter Cleaning", "interval_days": 180, "priority": "medium"},
        {"name": "Water Heater Flush", "interval_days": 365, "priority": "medium"},
    ],
    "appliance": [
        {"name": "Deep Clean", "interval_days": 90, "priority": "low"},
        {"name": "Filter Replacement", "interval_days": 180, "priority": "medium"},
        {"name": "Maintenance Check", "interval_days": 365, "priority": "medium"},
    ],
}

# ============================================
# HELPER FUNCTIONS
# ============================================
def generate_id():
    return str(uuid.uuid4())[:8]

def days_until_due(due_date_str):
    try:
        due = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).replace(tzinfo=None)
        return (due - datetime.now()).days
    except:
        return 999

def get_status_class(days):
    if days < 0: return "overdue"
    elif days <= 7: return "due-soon"
    return "ok"

def get_status_text(days):
    if days < 0: return f"{abs(days)}d overdue"
    elif days == 0: return "Due today"
    elif days == 1: return "Due tomorrow"
    elif days <= 7: return f"Due in {days}d"
    elif days <= 30: return f"Due in {days}d"
    return f"Due in {days}d"

def complete_task(task_id):
    tasks = load_tasks()
    logs = load_logs()
    
    for task in tasks:
        if task['id'] == task_id:
            log = {
                "id": generate_id(),
                "task_id": task_id,
                "item_id": task['item_id'],
                "completed_at": datetime.now().isoformat()
            }
            logs.append(log)
            save_logs(logs)
            
            if task.get('interval_days', 0) > 0:
                task['next_due'] = (datetime.now() + timedelta(days=task['interval_days'])).isoformat()
                task['last_completed'] = datetime.now().isoformat()
            break
    save_tasks(tasks)

def delete_item(item_id):
    items = [i for i in load_items() if i['id'] != item_id]
    tasks = [t for t in load_tasks() if t['item_id'] != item_id]
    save_items(items)
    save_tasks(tasks)

def delete_task(task_id):
    tasks = [t for t in load_tasks() if t['id'] != task_id]
    save_tasks(tasks)

# ============================================
# NAVIGATION STATE
# ============================================
if 'page' not in st.session_state:
    st.session_state.page = 'dashboard'

def navigate(page):
    st.session_state.page = page

# ============================================
# SIDEBAR
# ============================================
with st.sidebar:
    st.markdown("### Maintenance Minder")
    st.markdown("---")
    
    if st.button("Dashboard", use_container_width=True, type="secondary" if st.session_state.page != 'dashboard' else "primary"):
        navigate('dashboard')
        st.rerun()
    
    if st.button("My Items", use_container_width=True, type="secondary" if st.session_state.page != 'items' else "primary"):
        navigate('items')
        st.rerun()
    
    if st.button("All Tasks", use_container_width=True, type="secondary" if st.session_state.page != 'tasks' else "primary"):
        navigate('tasks')
        st.rerun()
    
    st.markdown("---")
    
    if st.button("+ Add New Item", use_container_width=True):
        navigate('add_item')
        st.rerun()
    
    st.markdown("---")
    
    if st.button("Settings", use_container_width=True, type="secondary"):
        navigate('settings')
        st.rerun()

# ============================================
# PAGES
# ============================================

def show_dashboard():
    st.markdown('<div class="page-title">Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Overview of your maintenance schedule</div>', unsafe_allow_html=True)
    
    items = load_items()
    tasks = load_tasks()
    
    active_tasks = [t for t in tasks if t.get('is_active', True)]
    overdue = [t for t in active_tasks if days_until_due(t['next_due']) < 0]
    due_soon = [t for t in active_tasks if 0 <= days_until_due(t['next_due']) <= 7]
    
    # Stats
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f'''
        <div class="stat-card">
            <div class="stat-value">{len(items)}</div>
            <div class="stat-label">Items Tracked</div>
        </div>
        ''', unsafe_allow_html=True)
    
    with col2:
        st.markdown(f'''
        <div class="stat-card">
            <div class="stat-value">{len(active_tasks)}</div>
            <div class="stat-label">Active Tasks</div>
        </div>
        ''', unsafe_allow_html=True)
    
    with col3:
        st.markdown(f'''
        <div class="stat-card">
            <div class="stat-value" style="color: #ef4444;">{len(overdue)}</div>
            <div class="stat-label">Overdue</div>
        </div>
        ''', unsafe_allow_html=True)
    
    with col4:
        st.markdown(f'''
        <div class="stat-card">
            <div class="stat-value" style="color: #f59e0b;">{len(due_soon)}</div>
            <div class="stat-label">Due This Week</div>
        </div>
        ''', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Overdue Tasks
    if overdue:
        st.markdown('<div class="section-header">Overdue</div>', unsafe_allow_html=True)
        for task in sorted(overdue, key=lambda t: t['next_due']):
            item = next((i for i in items if i['id'] == task['item_id']), None)
            item_name = item['name'] if item else "Unknown"
            days = days_until_due(task['next_due'])
            
            col1, col2, col3 = st.columns([4, 2, 1])
            with col1:
                st.markdown(f"**{task['name']}**  \n{item_name}")
            with col2:
                st.markdown(f'<span class="status-overdue">{abs(days)} days overdue</span>', unsafe_allow_html=True)
            with col3:
                if st.button("Complete", key=f"d_comp_{task['id']}"):
                    complete_task(task['id'])
                    st.rerun()
        st.markdown("<br>", unsafe_allow_html=True)
    
    # Due Soon
    if due_soon:
        st.markdown('<div class="section-header">Due This Week</div>', unsafe_allow_html=True)
        for task in sorted(due_soon, key=lambda t: t['next_due']):
            item = next((i for i in items if i['id'] == task['item_id']), None)
            item_name = item['name'] if item else "Unknown"
            days = days_until_due(task['next_due'])
            
            col1, col2, col3 = st.columns([4, 2, 1])
            with col1:
                st.markdown(f"**{task['name']}**  \n{item_name}")
            with col2:
                st.markdown(f'<span class="status-soon">{get_status_text(days)}</span>', unsafe_allow_html=True)
            with col3:
                if st.button("Complete", key=f"d_comp2_{task['id']}"):
                    complete_task(task['id'])
                    st.rerun()
    
    if not overdue and not due_soon and items:
        st.success("You're all caught up. No urgent maintenance tasks.")
    
    if not items:
        st.markdown('''
        <div class="empty-state">
            <h3>Welcome to Maintenance Minder</h3>
            <p>Add your first item to start tracking maintenance schedules.</p>
        </div>
        ''', unsafe_allow_html=True)
        if st.button("Add Your First Item"):
            navigate('add_item')
            st.rerun()

def show_items():
    st.markdown('<div class="page-title">My Items</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Manage your vehicles, home, and appliances</div>', unsafe_allow_html=True)
    
    items = load_items()
    tasks = load_tasks()
    
    if not items:
        st.markdown('''
        <div class="empty-state">
            <h3>No items yet</h3>
            <p>Add your first vehicle, home, or appliance to track.</p>
        </div>
        ''', unsafe_allow_html=True)
        if st.button("Add Item"):
            navigate('add_item')
            st.rerun()
        return
    
    for item in items:
        item_tasks = [t for t in tasks if t['item_id'] == item['id'] and t.get('is_active', True)]
        next_task = min(item_tasks, key=lambda t: t['next_due']) if item_tasks else None
        
        type_class = f"type-{item.get('type', 'other')}"
        
        with st.expander(f"**{item['name']}** — {item.get('brand', '')} {item.get('model', '')}".strip()):
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.markdown(f'<span class="type-badge {type_class}">{item.get("type", "other")}</span>', unsafe_allow_html=True)
                if item.get('notes'):
                    st.caption(item['notes'])
                st.markdown(f"**{len(item_tasks)}** active maintenance tasks")
            
            with col2:
                if next_task:
                    days = days_until_due(next_task['next_due'])
                    status_class = f"status-{get_status_class(days)}"
                    st.markdown(f"Next: **{next_task['name']}**")
                    st.markdown(f'<span class="{status_class}">{get_status_text(days)}</span>', unsafe_allow_html=True)
            
            st.markdown("---")
            
            if item_tasks:
                for task in sorted(item_tasks, key=lambda t: t['next_due']):
                    days = days_until_due(task['next_due'])
                    priority = task.get('priority', 'medium')
                    
                    tcol1, tcol2, tcol3 = st.columns([3, 2, 1])
                    with tcol1:
                        st.markdown(f'<span class="priority-dot priority-{priority}"></span> {task["name"]}', unsafe_allow_html=True)
                    with tcol2:
                        status_class = f"status-{get_status_class(days)}"
                        st.markdown(f'<span class="{status_class}">{get_status_text(days)}</span>', unsafe_allow_html=True)
                    with tcol3:
                        if st.button("Done", key=f"i_comp_{task['id']}"):
                            complete_task(task['id'])
                            st.rerun()
            
            st.markdown("<br>", unsafe_allow_html=True)
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Add Task", key=f"add_task_{item['id']}"):
                    st.session_state.add_task_item = item['id']
                    navigate('add_task')
                    st.rerun()
            with col2:
                if st.button("Delete Item", key=f"del_{item['id']}"):
                    delete_item(item['id'])
                    st.rerun()

def show_tasks():
    st.markdown('<div class="page-title">All Tasks</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">View and manage all maintenance tasks</div>', unsafe_allow_html=True)
    
    items = load_items()
    tasks = load_tasks()
    
    if not tasks:
        st.info("No tasks yet. Add items to create maintenance tasks.")
        return
    
    filter_opt = st.selectbox("Filter", ["All Active", "Overdue", "Due This Week", "Upcoming"], label_visibility="collapsed")
    
    active = [t for t in tasks if t.get('is_active', True)]
    
    if filter_opt == "Overdue":
        filtered = [t for t in active if days_until_due(t['next_due']) < 0]
    elif filter_opt == "Due This Week":
        filtered = [t for t in active if 0 <= days_until_due(t['next_due']) <= 7]
    elif filter_opt == "Upcoming":
        filtered = [t for t in active if days_until_due(t['next_due']) > 7]
    else:
        filtered = active
    
    for task in sorted(filtered, key=lambda t: t['next_due']):
        item = next((i for i in items if i['id'] == task['item_id']), None)
        item_name = item['name'] if item else "Unknown"
        days = days_until_due(task['next_due'])
        priority = task.get('priority', 'medium')
        status_class = f"status-{get_status_class(days)}"
        
        col1, col2, col3, col4 = st.columns([3, 2, 2, 1])
        with col1:
            st.markdown(f'<span class="priority-dot priority-{priority}"></span> **{task["name"]}**', unsafe_allow_html=True)
            st.caption(item_name)
        with col2:
            st.markdown(f'<span class="{status_class}">{get_status_text(days)}</span>', unsafe_allow_html=True)
        with col3:
            st.caption(f"Every {task.get('interval_days', 0)} days")
        with col4:
            if st.button("Done", key=f"t_comp_{task['id']}"):
                complete_task(task['id'])
                st.rerun()

def show_add_item():
    st.markdown('<div class="page-title">Add New Item</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Track a new vehicle, home, or appliance</div>', unsafe_allow_html=True)
    
    with st.form("add_item_form"):
        name = st.text_input("Name", placeholder="e.g., Honda Accord, Main House")
        
        item_type = st.selectbox("Type", ["vehicle", "home", "appliance"])
        
        col1, col2 = st.columns(2)
        with col1:
            brand = st.text_input("Brand (optional)", placeholder="e.g., Honda, Samsung")
        with col2:
            model = st.text_input("Model (optional)", placeholder="e.g., Accord, RF28R")
        
        notes = st.text_area("Notes (optional)", placeholder="Any additional details...")
        
        add_templates = st.checkbox("Add recommended maintenance schedule", value=True)
        
        submitted = st.form_submit_button("Save Item", use_container_width=True)
        
        if submitted:
            if not name:
                st.error("Please enter a name for this item.")
            else:
                item_id = generate_id()
                item = {
                    "id": item_id,
                    "name": name,
                    "type": item_type,
                    "brand": brand,
                    "model": model,
                    "notes": notes,
                    "created_at": datetime.now().isoformat()
                }
                
                items = load_items()
                items.append(item)
                save_items(items)
                
                if add_templates and item_type in TEMPLATES:
                    tasks = load_tasks()
                    for template in TEMPLATES[item_type]:
                        task = {
                            "id": generate_id(),
                            "item_id": item_id,
                            "name": template["name"],
                            "interval_days": template["interval_days"],
                            "priority": template["priority"],
                            "next_due": (datetime.now() + timedelta(days=template["interval_days"])).isoformat(),
                            "is_active": True,
                            "created_at": datetime.now().isoformat()
                        }
                        tasks.append(task)
                    save_tasks(tasks)
                
                st.success(f"Added {name} successfully!")
                navigate('items')
                st.rerun()

def show_add_task():
    item_id = st.session_state.get('add_task_item')
    items = load_items()
    item = next((i for i in items if i['id'] == item_id), None)
    
    if not item:
        st.error("Item not found.")
        if st.button("Back to Items"):
            navigate('items')
            st.rerun()
        return
    
    st.markdown(f'<div class="page-title">Add Task</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="page-subtitle">Add maintenance task for {item["name"]}</div>', unsafe_allow_html=True)
    
    with st.form("add_task_form"):
        name = st.text_input("Task Name", placeholder="e.g., Oil Change, Filter Replacement")
        
        col1, col2 = st.columns(2)
        with col1:
            interval = st.number_input("Repeat every (days)", min_value=1, value=90)
        with col2:
            priority = st.selectbox("Priority", ["low", "medium", "high", "critical"])
        
        submitted = st.form_submit_button("Add Task", use_container_width=True)
        
        if submitted:
            if not name:
                st.error("Please enter a task name.")
            else:
                task = {
                    "id": generate_id(),
                    "item_id": item_id,
                    "name": name,
                    "interval_days": interval,
                    "priority": priority,
                    "next_due": (datetime.now() + timedelta(days=interval)).isoformat(),
                    "is_active": True,
                    "created_at": datetime.now().isoformat()
                }
                tasks = load_tasks()
                tasks.append(task)
                save_tasks(tasks)
                
                st.success(f"Added {name}!")
                navigate('items')
                st.rerun()

def show_settings():
    st.markdown('<div class="page-title">Settings</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Manage your data and preferences</div>', unsafe_allow_html=True)
    
    items = load_items()
    tasks = load_tasks()
    logs = load_logs()
    
    st.markdown('<div class="section-header">Data Summary</div>', unsafe_allow_html=True)
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Items", len(items))
    with col2:
        st.metric("Tasks", len(tasks))
    with col3:
        st.metric("Completed", len(logs))
    
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="section-header">Export</div>', unsafe_allow_html=True)
    
    if st.button("Download Data (JSON)"):
        data = {"items": items, "tasks": tasks, "logs": logs, "exported_at": datetime.now().isoformat()}
        st.download_button(
            "Download",
            data=json.dumps(data, indent=2, default=str),
            file_name="maintenance_minder_backup.json",
            mime="application/json"
        )
    
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="section-header">Danger Zone</div>', unsafe_allow_html=True)
    
    if st.button("Clear All Data", type="secondary"):
        save_items([])
        save_tasks([])
        save_logs([])
        st.success("All data cleared.")
        st.rerun()

# ============================================
# MAIN ROUTER
# ============================================
page = st.session_state.page

if page == 'dashboard':
    show_dashboard()
elif page == 'items':
    show_items()
elif page == 'tasks':
    show_tasks()
elif page == 'add_item':
    show_add_item()
elif page == 'add_task':
    show_add_task()
elif page == 'settings':
    show_settings()
else:
    show_dashboard()
