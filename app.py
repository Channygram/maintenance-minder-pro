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
# PROFESSIONAL CSS
# ============================================
st.markdown("""
<style>
    .stApp {
        background: #09090b;
    }
    
    #MainMenu, footer, header {visibility: hidden;}
    
    [data-testid="stSidebar"] {
        background: #09090b;
        border-right: 1px solid #18181b;
    }
    
    h1, h2, h3 {
        color: #fafafa !important;
        font-weight: 600 !important;
    }
    
    .stat-card {
        background: linear-gradient(135deg, #18181b 0%, #1f1f23 100%);
        border: 1px solid #27272a;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
    }
    .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #fafafa;
    }
    .stat-label {
        font-size: 13px;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 4px;
    }
    
    .status-overdue { color: #ef4444; font-weight: 600; }
    .status-soon { color: #f59e0b; font-weight: 600; }
    .status-ok { color: #10b981; font-weight: 600; }
    
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
    
    .section-header {
        font-size: 14px;
        font-weight: 600;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #27272a;
    }
    
    .empty-state {
        text-align: center;
        padding: 60px 40px;
        background: #18181b;
        border: 1px dashed #27272a;
        border-radius: 12px;
    }
    .empty-state h3 { color: #fafafa; margin-bottom: 8px; }
    .empty-state p { color: #71717a; }
    
    .card {
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 12px;
    }
    
    .vehicle-card {
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-weight: 600;
        color: white;
    }
    .stButton > button:hover {
        opacity: 0.9;
    }
    
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea,
    .stSelectbox > div > div,
    .stNumberInput > div > div > input {
        background: #18181b !important;
        border: 1px solid #27272a !important;
        border-radius: 8px !important;
        color: #fafafa !important;
    }
    
    .page-title {
        font-size: 28px;
        font-weight: 700;
        color: #fafafa;
        margin-bottom: 8px;
    }
    .page-subtitle {
        font-size: 14px;
        color: #71717a;
        margin-bottom: 32px;
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
# TYPE-SPECIFIC CONFIGURATIONS
# ============================================
TYPE_CONFIG = {
    "vehicle": {
        "label": "Vehicle",
        "icon": "🚗",
        "name_placeholder": "e.g., 2020 Honda Accord, My Tesla",
        "brand_placeholder": "e.g., Honda, Toyota, Tesla",
        "model_placeholder": "e.g., Accord, Camry, Model 3",
        "notes_placeholder": "VIN, license plate, purchase date...",
        "supports_mileage": True,
    },
    "home": {
        "label": "Home",
        "icon": "🏠",
        "name_placeholder": "e.g., Main House, Lake Cabin, Rental Property",
        "brand_placeholder": "e.g., Builder name (optional)",
        "model_placeholder": "e.g., Year built (optional)",
        "notes_placeholder": "Address, square footage, special systems...",
        "supports_mileage": False,
    },
    "appliance": {
        "label": "Appliance",
        "icon": "🔌",
        "name_placeholder": "e.g., Kitchen Refrigerator, Washer, HVAC Unit",
        "brand_placeholder": "e.g., Samsung, LG, Carrier",
        "model_placeholder": "e.g., RF28R7351SR, WM4500HBA",
        "notes_placeholder": "Serial number, warranty info, purchase date...",
        "supports_mileage": False,
    },
}

# ============================================
# MAINTENANCE TEMPLATES
# ============================================
TEMPLATES = {
    "vehicle": [
        {"name": "Oil Change", "interval": 5000, "unit": "miles", "priority": "high"},
        {"name": "Tire Rotation", "interval": 5000, "unit": "miles", "priority": "medium"},
        {"name": "Air Filter", "interval": 15000, "unit": "miles", "priority": "low"},
        {"name": "Brake Inspection", "interval": 12000, "unit": "miles", "priority": "high"},
        {"name": "Transmission Fluid", "interval": 30000, "unit": "miles", "priority": "medium"},
        {"name": "Coolant Flush", "interval": 30000, "unit": "miles", "priority": "medium"},
        {"name": "Battery Check", "interval": 365, "unit": "days", "priority": "medium"},
        {"name": "Wiper Blades", "interval": 180, "unit": "days", "priority": "low"},
        {"name": "Registration Renewal", "interval": 365, "unit": "days", "priority": "high"},
        {"name": "Insurance Renewal", "interval": 180, "unit": "days", "priority": "high"},
    ],
    "home": [
        {"name": "HVAC Filter Change", "interval": 90, "unit": "days", "priority": "high"},
        {"name": "Smoke Detector Test", "interval": 30, "unit": "days", "priority": "critical"},
        {"name": "Smoke Detector Batteries", "interval": 180, "unit": "days", "priority": "critical"},
        {"name": "Gutter Cleaning", "interval": 180, "unit": "days", "priority": "medium"},
        {"name": "Water Heater Flush", "interval": 365, "unit": "days", "priority": "medium"},
        {"name": "Dryer Vent Cleaning", "interval": 365, "unit": "days", "priority": "high"},
        {"name": "Pest Control", "interval": 90, "unit": "days", "priority": "medium"},
        {"name": "Lawn Care", "interval": 14, "unit": "days", "priority": "low"},
    ],
    "appliance": [
        {"name": "Deep Clean", "interval": 90, "unit": "days", "priority": "low"},
        {"name": "Filter Replacement", "interval": 180, "unit": "days", "priority": "medium"},
        {"name": "Maintenance Check", "interval": 365, "unit": "days", "priority": "medium"},
        {"name": "Warranty Expiration", "interval": 365, "unit": "days", "priority": "high"},
    ],
}

# ============================================
# HELPER FUNCTIONS
# ============================================
def generate_id():
    return str(uuid.uuid4())[:8]

def days_until_due(task):
    """Calculate days until due for time-based tasks."""
    try:
        due_date = task.get('next_due_date')
        if due_date:
            due = datetime.fromisoformat(due_date.replace('Z', '+00:00')).replace(tzinfo=None)
            return (due - datetime.now()).days
        return 999
    except:
        return 999

def get_status_text(task):
    """Get human-readable status text."""
    unit = task.get('unit', 'days')
    
    if unit == 'miles':
        current = task.get('current_mileage', 0)
        due_at = task.get('due_at_mileage', 0)
        remaining = due_at - current
        if remaining <= 0:
            return f"{abs(remaining):,} miles overdue"
        elif remaining <= 500:
            return f"{remaining:,} miles left"
        else:
            return f"{remaining:,} miles to go"
    else:
        days = days_until_due(task)
        if days < 0:
            return f"{abs(days)} days overdue"
        elif days == 0:
            return "Due today"
        elif days == 1:
            return "Due tomorrow"
        elif days <= 7:
            return f"Due in {days} days"
        elif days <= 30:
            weeks = days // 7
            return f"Due in {weeks} week{'s' if weeks > 1 else ''}"
        else:
            return f"Due in {days} days"

def is_overdue(task):
    """Check if task is overdue."""
    unit = task.get('unit', 'days')
    if unit == 'miles':
        current = task.get('current_mileage', 0)
        due_at = task.get('due_at_mileage', 0)
        return current >= due_at
    else:
        return days_until_due(task) < 0

def is_due_soon(task):
    """Check if task is due soon (within threshold)."""
    unit = task.get('unit', 'days')
    if unit == 'miles':
        current = task.get('current_mileage', 0)
        due_at = task.get('due_at_mileage', 0)
        remaining = due_at - current
        return 0 < remaining <= 500
    else:
        days = days_until_due(task)
        return 0 <= days <= 7

def complete_task(task_id):
    """Mark a task as complete and schedule next occurrence."""
    tasks = load_tasks()
    logs = load_logs()
    items = load_items()
    
    for task in tasks:
        if task['id'] == task_id:
            now = datetime.now()
            
            # Find the item to get current mileage
            item = next((i for i in items if i['id'] == task['item_id']), None)
            
            # Log completion
            log = {
                "id": generate_id(),
                "task_id": task_id,
                "item_id": task['item_id'],
                "completed_at": now.isoformat(),
            }
            if task.get('unit') == 'miles' and item:
                log['mileage'] = item.get('current_mileage', 0)
            logs.append(log)
            save_logs(logs)
            
            # Update task for next occurrence
            task['last_completed'] = now.isoformat()
            
            if task.get('unit') == 'miles' and item:
                current = item.get('current_mileage', 0)
                interval = task.get('interval', 3000)
                task['current_mileage'] = current
                task['due_at_mileage'] = current + interval
            else:
                interval = task.get('interval', 90)
                task['next_due_date'] = (now + timedelta(days=interval)).isoformat()
            
            break
    
    save_tasks(tasks)

def update_vehicle_mileage(item_id, new_mileage):
    """Update mileage for a vehicle and all its mileage-based tasks."""
    items = load_items()
    tasks = load_tasks()
    
    for item in items:
        if item['id'] == item_id:
            item['current_mileage'] = new_mileage
            item['mileage_updated_at'] = datetime.now().isoformat()
            break
    
    for task in tasks:
        if task['item_id'] == item_id and task.get('unit') == 'miles':
            task['current_mileage'] = new_mileage
    
    save_items(items)
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
# NAVIGATION
# ============================================
if 'page' not in st.session_state:
    st.session_state.page = 'dashboard'
if 'add_item_type' not in st.session_state:
    st.session_state.add_item_type = 'vehicle'

def navigate(page, **kwargs):
    st.session_state.page = page
    for k, v in kwargs.items():
        st.session_state[k] = v

# ============================================
# SIDEBAR
# ============================================
with st.sidebar:
    st.markdown("### Maintenance Minder")
    st.markdown("---")
    
    if st.button("Dashboard", use_container_width=True, type="primary" if st.session_state.page == 'dashboard' else "secondary"):
        navigate('dashboard')
        st.rerun()
    
    if st.button("My Items", use_container_width=True, type="primary" if st.session_state.page == 'items' else "secondary"):
        navigate('items')
        st.rerun()
    
    if st.button("All Tasks", use_container_width=True, type="primary" if st.session_state.page == 'tasks' else "secondary"):
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
    overdue = [t for t in active_tasks if is_overdue(t)]
    due_soon = [t for t in active_tasks if is_due_soon(t) and not is_overdue(t)]
    vehicles = [i for i in items if i.get('type') == 'vehicle']
    
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
            <div class="stat-label">Due Soon</div>
        </div>
        ''', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Quick Mileage Update for Vehicles
    if vehicles:
        st.markdown('<div class="section-header">Quick Mileage Update</div>', unsafe_allow_html=True)
        for vehicle in vehicles:
            col1, col2, col3 = st.columns([3, 2, 1])
            with col1:
                st.markdown(f"**{vehicle['name']}**")
                current = vehicle.get('current_mileage', 0)
                st.caption(f"Current: {current:,} miles")
            with col2:
                new_mileage = st.number_input(
                    "New mileage",
                    min_value=current,
                    value=current,
                    step=100,
                    key=f"dash_mileage_{vehicle['id']}",
                    label_visibility="collapsed"
                )
            with col3:
                if st.button("Update", key=f"dash_update_{vehicle['id']}"):
                    if new_mileage > current:
                        update_vehicle_mileage(vehicle['id'], new_mileage)
                        st.rerun()
        st.markdown("<br>", unsafe_allow_html=True)
    
    # Overdue Tasks
    if overdue:
        st.markdown('<div class="section-header">Overdue</div>', unsafe_allow_html=True)
        for task in overdue:
            item = next((i for i in items if i['id'] == task['item_id']), None)
            item_name = item['name'] if item else "Unknown"
            
            col1, col2, col3 = st.columns([4, 2, 1])
            with col1:
                st.markdown(f"**{task['name']}**")
                st.caption(item_name)
            with col2:
                st.markdown(f'<span class="status-overdue">{get_status_text(task)}</span>', unsafe_allow_html=True)
            with col3:
                if st.button("Done", key=f"d_comp_{task['id']}"):
                    complete_task(task['id'])
                    st.rerun()
        st.markdown("<br>", unsafe_allow_html=True)
    
    # Due Soon
    if due_soon:
        st.markdown('<div class="section-header">Due Soon</div>', unsafe_allow_html=True)
        for task in due_soon:
            item = next((i for i in items if i['id'] == task['item_id']), None)
            item_name = item['name'] if item else "Unknown"
            
            col1, col2, col3 = st.columns([4, 2, 1])
            with col1:
                st.markdown(f"**{task['name']}**")
                st.caption(item_name)
            with col2:
                st.markdown(f'<span class="status-soon">{get_status_text(task)}</span>', unsafe_allow_html=True)
            with col3:
                if st.button("Done", key=f"d_comp2_{task['id']}"):
                    complete_task(task['id'])
                    st.rerun()
    
    if not overdue and not due_soon and items:
        st.success("You're all caught up! No urgent maintenance tasks.")
    
    if not items:
        st.markdown('''
        <div class="empty-state">
            <h3>Welcome to Maintenance Minder</h3>
            <p>Add your first vehicle, home, or appliance to start tracking maintenance.</p>
        </div>
        ''', unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("Add Your First Item", use_container_width=True):
            navigate('add_item')
            st.rerun()

def show_items():
    st.markdown('<div class="page-title">My Items</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Manage your vehicles, home, and appliances</div>', unsafe_allow_html=True)
    
    items = load_items()
    tasks = load_tasks()
    
    col1, col2 = st.columns([3, 1])
    with col2:
        if st.button("+ Add Item", use_container_width=True):
            navigate('add_item')
            st.rerun()
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    if not items:
        st.markdown('''
        <div class="empty-state">
            <h3>No items yet</h3>
            <p>Add your first vehicle, home, or appliance to track maintenance.</p>
        </div>
        ''', unsafe_allow_html=True)
        return
    
    for item in items:
        item_tasks = [t for t in tasks if t['item_id'] == item['id'] and t.get('is_active', True)]
        overdue_count = len([t for t in item_tasks if is_overdue(t)])
        item_type = item.get('type', 'other')
        type_config = TYPE_CONFIG.get(item_type, TYPE_CONFIG['appliance'])
        
        with st.expander(f"{type_config['icon']} **{item['name']}** — {item.get('brand', '')} {item.get('model', '')}".strip(), expanded=False):
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.markdown(f'<span class="type-badge type-{item_type}">{type_config["label"]}</span>', unsafe_allow_html=True)
                if item.get('notes'):
                    st.caption(item['notes'])
                
                # Show current mileage for vehicles
                if item_type == 'vehicle':
                    current = item.get('current_mileage', 0)
                    st.markdown(f"**Odometer:** {current:,} miles")
                    if item.get('mileage_updated_at'):
                        updated = datetime.fromisoformat(item['mileage_updated_at']).strftime('%b %d, %Y')
                        st.caption(f"Last updated: {updated}")
            
            with col2:
                st.markdown(f"**{len(item_tasks)}** tasks")
                if overdue_count > 0:
                    st.markdown(f'<span class="status-overdue">{overdue_count} overdue</span>', unsafe_allow_html=True)
            
            st.markdown("---")
            
            # Task list
            if item_tasks:
                for task in sorted(item_tasks, key=lambda t: (not is_overdue(t), not is_due_soon(t))):
                    priority = task.get('priority', 'medium')
                    unit = task.get('unit', 'days')
                    interval = task.get('interval', 90)
                    
                    tcol1, tcol2, tcol3, tcol4 = st.columns([3, 2, 1, 1])
                    with tcol1:
                        st.markdown(f'<span class="priority-dot priority-{priority}"></span> **{task["name"]}**', unsafe_allow_html=True)
                        st.caption(f"Every {interval:,} {unit}")
                    with tcol2:
                        status_class = "overdue" if is_overdue(task) else ("soon" if is_due_soon(task) else "ok")
                        st.markdown(f'<span class="status-{status_class}">{get_status_text(task)}</span>', unsafe_allow_html=True)
                    with tcol3:
                        if st.button("Done", key=f"i_comp_{task['id']}"):
                            complete_task(task['id'])
                            st.rerun()
                    with tcol4:
                        if st.button("Edit", key=f"i_edit_{task['id']}"):
                            navigate('edit_task', edit_task_id=task['id'])
                            st.rerun()
            else:
                st.caption("No maintenance tasks yet.")
            
            st.markdown("<br>", unsafe_allow_html=True)
            
            # Action buttons - different for each type
            if item_type == 'vehicle':
                col1, col2, col3 = st.columns(3)
                with col1:
                    if st.button("Add Task", key=f"add_task_{item['id']}", use_container_width=True):
                        navigate('add_task', add_task_item_id=item['id'])
                        st.rerun()
                with col2:
                    if st.button("Update Mileage", key=f"mileage_{item['id']}", use_container_width=True):
                        navigate('update_mileage', mileage_item_id=item['id'])
                        st.rerun()
                with col3:
                    if st.button("Delete", key=f"del_{item['id']}", use_container_width=True):
                        delete_item(item['id'])
                        st.rerun()
            else:
                col1, col2 = st.columns(2)
                with col1:
                    if st.button("Add Task", key=f"add_task_{item['id']}", use_container_width=True):
                        navigate('add_task', add_task_item_id=item['id'])
                        st.rerun()
                with col2:
                    if st.button("Delete", key=f"del_{item['id']}", use_container_width=True):
                        delete_item(item['id'])
                        st.rerun()

def show_add_item():
    st.markdown('<div class="page-title">Add New Item</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Track a new vehicle, home, or appliance</div>', unsafe_allow_html=True)
    
    # Type selection OUTSIDE the form for dynamic updates
    type_options = list(TYPE_CONFIG.keys())
    type_labels = [f"{TYPE_CONFIG[t]['icon']} {TYPE_CONFIG[t]['label']}" for t in type_options]
    
    selected_idx = st.selectbox(
        "What are you adding?",
        range(len(type_options)),
        format_func=lambda i: type_labels[i],
        index=type_options.index(st.session_state.add_item_type)
    )
    item_type = type_options[selected_idx]
    st.session_state.add_item_type = item_type
    
    config = TYPE_CONFIG[item_type]
    
    st.markdown("---")
    
    with st.form("add_item_form"):
        name = st.text_input(f"{config['label']} Name", placeholder=config['name_placeholder'])
        
        col1, col2 = st.columns(2)
        with col1:
            brand = st.text_input("Brand (optional)", placeholder=config['brand_placeholder'])
        with col2:
            model = st.text_input("Model (optional)", placeholder=config['model_placeholder'])
        
        # Type-specific fields
        current_mileage = 0
        if config['supports_mileage']:
            st.markdown("---")
            st.markdown("**Odometer Reading**")
            current_mileage = st.number_input(
                "Current mileage",
                min_value=0,
                value=0,
                step=100,
                help="Enter your current odometer reading. This helps track mileage-based maintenance."
            )
        
        notes = st.text_area("Notes (optional)", placeholder=config['notes_placeholder'])
        
        add_templates = st.checkbox("Add recommended maintenance schedule", value=True)
        
        submitted = st.form_submit_button("Save Item", use_container_width=True)
        
        if submitted:
            if not name:
                st.error("Please enter a name.")
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
                
                if config['supports_mileage']:
                    item['current_mileage'] = current_mileage
                    item['mileage_updated_at'] = datetime.now().isoformat()
                
                items = load_items()
                items.append(item)
                save_items(items)
                
                # Add template tasks
                if add_templates and item_type in TEMPLATES:
                    tasks_list = load_tasks()
                    for template in TEMPLATES[item_type]:
                        unit = template.get('unit', 'days')
                        interval = template.get('interval', 90)
                        
                        task = {
                            "id": generate_id(),
                            "item_id": item_id,
                            "name": template["name"],
                            "interval": interval,
                            "unit": unit,
                            "priority": template["priority"],
                            "is_active": True,
                            "created_at": datetime.now().isoformat()
                        }
                        
                        if unit == 'miles':
                            task['current_mileage'] = current_mileage
                            task['due_at_mileage'] = current_mileage + interval
                        else:
                            task['next_due_date'] = (datetime.now() + timedelta(days=interval)).isoformat()
                        
                        tasks_list.append(task)
                    save_tasks(tasks_list)
                
                st.success(f"Added {name}!")
                navigate('items')
                st.rerun()
    
    if st.button("Cancel"):
        navigate('items')
        st.rerun()

def show_add_task():
    item_id = st.session_state.get('add_task_item_id')
    items = load_items()
    item = next((i for i in items if i['id'] == item_id), None)
    
    if not item:
        st.error("Item not found.")
        if st.button("Back"):
            navigate('items')
            st.rerun()
        return
    
    item_type = item.get('type', 'other')
    type_config = TYPE_CONFIG.get(item_type, TYPE_CONFIG['appliance'])
    
    st.markdown(f'<div class="page-title">Add Task</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="page-subtitle">New maintenance task for {item["name"]}</div>', unsafe_allow_html=True)
    
    with st.form("add_task_form"):
        name = st.text_input("Task Name", placeholder="e.g., Oil Change, Filter Replacement")
        
        col1, col2 = st.columns(2)
        with col1:
            # Only show miles option for vehicles
            if type_config['supports_mileage']:
                unit = st.selectbox("Track by", ["miles", "days"])
            else:
                unit = "days"
                st.text_input("Track by", value="Days", disabled=True)
        
        with col2:
            if unit == "miles":
                interval = st.number_input("Interval (miles)", min_value=100, value=5000, step=500)
            else:
                interval = st.number_input("Interval (days)", min_value=1, value=90, step=1)
        
        priority = st.selectbox("Priority", ["low", "medium", "high", "critical"])
        
        st.markdown("---")
        st.markdown("**When was this last done?**")
        
        last_completed_option = st.radio(
            "Last completed",
            ["Not sure / Start tracking from now", "Enter specific date"],
            horizontal=True
        )
        
        last_date = None
        last_mileage = None
        
        if last_completed_option == "Enter specific date":
            last_date = st.date_input("Date last completed", value=datetime.now().date())
        
        if unit == "miles":
            last_mileage = st.number_input(
                "Mileage at last service",
                min_value=0,
                value=item.get('current_mileage', 0),
                step=100,
                help="What was your odometer reading when this was last done?"
            )
        
        submitted = st.form_submit_button("Add Task", use_container_width=True)
        
        if submitted:
            if not name:
                st.error("Please enter a task name.")
            else:
                task = {
                    "id": generate_id(),
                    "item_id": item_id,
                    "name": name,
                    "interval": interval,
                    "unit": unit,
                    "priority": priority,
                    "is_active": True,
                    "created_at": datetime.now().isoformat()
                }
                
                if unit == "miles":
                    current = item.get('current_mileage', 0)
                    if last_mileage and last_mileage > 0:
                        task['due_at_mileage'] = last_mileage + interval
                        task['last_completed_mileage'] = last_mileage
                    else:
                        task['due_at_mileage'] = current + interval
                    task['current_mileage'] = current
                else:
                    if last_date and last_completed_option == "Enter specific date":
                        task['last_completed'] = datetime.combine(last_date, datetime.min.time()).isoformat()
                        task['next_due_date'] = (datetime.combine(last_date, datetime.min.time()) + timedelta(days=interval)).isoformat()
                    else:
                        task['next_due_date'] = (datetime.now() + timedelta(days=interval)).isoformat()
                
                tasks = load_tasks()
                tasks.append(task)
                save_tasks(tasks)
                
                st.success(f"Added {name}!")
                navigate('items')
                st.rerun()
    
    if st.button("Cancel"):
        navigate('items')
        st.rerun()

def show_edit_task():
    task_id = st.session_state.get('edit_task_id')
    tasks = load_tasks()
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if not task:
        st.error("Task not found.")
        if st.button("Back"):
            navigate('items')
            st.rerun()
        return
    
    items = load_items()
    item = next((i for i in items if i['id'] == task['item_id']), None)
    item_type = item.get('type', 'other') if item else 'other'
    type_config = TYPE_CONFIG.get(item_type, TYPE_CONFIG['appliance'])
    
    st.markdown(f'<div class="page-title">Edit Task</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="page-subtitle">{task["name"]} for {item["name"] if item else "Unknown"}</div>', unsafe_allow_html=True)
    
    with st.form("edit_task_form"):
        name = st.text_input("Task Name", value=task['name'])
        
        col1, col2 = st.columns(2)
        with col1:
            current_unit = task.get('unit', 'days')
            if type_config['supports_mileage']:
                unit_options = ["days", "miles"]
                unit = st.selectbox("Track by", unit_options, index=unit_options.index(current_unit))
            else:
                unit = "days"
                st.text_input("Track by", value="Days", disabled=True)
        
        with col2:
            current_interval = task.get('interval', 90)
            if unit == "miles":
                interval = st.number_input("Interval (miles)", min_value=100, value=current_interval, step=500)
            else:
                interval = st.number_input("Interval (days)", min_value=1, value=current_interval, step=1)
        
        current_priority = task.get('priority', 'medium')
        priority_options = ["low", "medium", "high", "critical"]
        priority = st.selectbox("Priority", priority_options, index=priority_options.index(current_priority))
        
        st.markdown("---")
        st.markdown("**Reset next due date/mileage?**")
        
        update_last = st.checkbox("Yes, update when this was last completed")
        
        last_date = None
        last_mileage = None
        
        if update_last:
            col1, col2 = st.columns(2)
            with col1:
                last_date = st.date_input("Last completed date", value=datetime.now().date())
            if unit == "miles" and item:
                with col2:
                    last_mileage = st.number_input(
                        "Mileage at last service",
                        min_value=0,
                        value=item.get('current_mileage', 0),
                        step=100
                    )
        
        submitted = st.form_submit_button("Save Changes", use_container_width=True)
        
        if submitted:
            task['name'] = name
            task['interval'] = interval
            task['unit'] = unit
            task['priority'] = priority
            
            if update_last:
                if unit == "miles" and item and last_mileage:
                    task['due_at_mileage'] = last_mileage + interval
                    task['last_completed_mileage'] = last_mileage
                    task['current_mileage'] = item.get('current_mileage', 0)
                    task['last_completed'] = datetime.combine(last_date, datetime.min.time()).isoformat()
                else:
                    task['last_completed'] = datetime.combine(last_date, datetime.min.time()).isoformat()
                    task['next_due_date'] = (datetime.combine(last_date, datetime.min.time()) + timedelta(days=interval)).isoformat()
            elif task.get('unit') != unit:
                # Unit changed, recalculate
                if unit == "miles" and item:
                    current = item.get('current_mileage', 0)
                    task['due_at_mileage'] = current + interval
                    task['current_mileage'] = current
                else:
                    task['next_due_date'] = (datetime.now() + timedelta(days=interval)).isoformat()
            
            save_tasks(tasks)
            st.success("Task updated!")
            navigate('items')
            st.rerun()
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Cancel", use_container_width=True):
            navigate('items')
            st.rerun()
    with col2:
        if st.button("Delete Task", use_container_width=True):
            delete_task(task_id)
            navigate('items')
            st.rerun()

def show_update_mileage():
    item_id = st.session_state.get('mileage_item_id')
    items = load_items()
    item = next((i for i in items if i['id'] == item_id), None)
    
    if not item:
        st.error("Item not found.")
        if st.button("Back"):
            navigate('items')
            st.rerun()
        return
    
    st.markdown(f'<div class="page-title">Update Mileage</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="page-subtitle">{item["name"]}</div>', unsafe_allow_html=True)
    
    current = item.get('current_mileage', 0)
    
    st.markdown(f"**Current odometer:** {current:,} miles")
    if item.get('mileage_updated_at'):
        updated = datetime.fromisoformat(item['mileage_updated_at']).strftime('%B %d, %Y')
        st.caption(f"Last updated: {updated}")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    with st.form("mileage_form"):
        new_mileage = st.number_input(
            "New odometer reading",
            min_value=current,
            value=current,
            step=100,
            help="Enter your current odometer reading"
        )
        
        submitted = st.form_submit_button("Update Mileage", use_container_width=True)
        
        if submitted:
            if new_mileage > current:
                update_vehicle_mileage(item_id, new_mileage)
                miles_driven = new_mileage - current
                st.success(f"Updated! You've driven {miles_driven:,} miles since last update.")
                navigate('items')
                st.rerun()
            else:
                st.warning("New mileage must be higher than current reading.")
    
    if st.button("Cancel"):
        navigate('items')
        st.rerun()

def show_tasks():
    st.markdown('<div class="page-title">All Tasks</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">View and manage all maintenance tasks</div>', unsafe_allow_html=True)
    
    items = load_items()
    tasks = load_tasks()
    
    if not tasks:
        st.info("No tasks yet. Add items to create maintenance tasks.")
        return
    
    filter_opt = st.selectbox("Filter", ["All Active", "Overdue", "Due Soon", "Upcoming"], label_visibility="collapsed")
    
    active = [t for t in tasks if t.get('is_active', True)]
    
    if filter_opt == "Overdue":
        filtered = [t for t in active if is_overdue(t)]
    elif filter_opt == "Due Soon":
        filtered = [t for t in active if is_due_soon(t) and not is_overdue(t)]
    elif filter_opt == "Upcoming":
        filtered = [t for t in active if not is_overdue(t) and not is_due_soon(t)]
    else:
        filtered = active
    
    filtered = sorted(filtered, key=lambda t: (not is_overdue(t), not is_due_soon(t), t.get('next_due_date', '9999')))
    
    if not filtered:
        st.info("No tasks match this filter.")
        return
    
    for task in filtered:
        item = next((i for i in items if i['id'] == task['item_id']), None)
        item_name = item['name'] if item else "Unknown"
        priority = task.get('priority', 'medium')
        unit = task.get('unit', 'days')
        interval = task.get('interval', 90)
        
        status_class = "overdue" if is_overdue(task) else ("soon" if is_due_soon(task) else "ok")
        
        col1, col2, col3, col4 = st.columns([3, 2, 2, 1])
        with col1:
            st.markdown(f'<span class="priority-dot priority-{priority}"></span> **{task["name"]}**', unsafe_allow_html=True)
            st.caption(f"{item_name} · Every {interval:,} {unit}")
        with col2:
            st.markdown(f'<span class="status-{status_class}">{get_status_text(task)}</span>', unsafe_allow_html=True)
        with col3:
            if task.get('last_completed'):
                last = datetime.fromisoformat(task['last_completed']).strftime('%b %d, %Y')
                st.caption(f"Last: {last}")
        with col4:
            if st.button("Done", key=f"t_comp_{task['id']}"):
                complete_task(task['id'])
                st.rerun()

def show_settings():
    st.markdown('<div class="page-title">Settings</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Manage your data</div>', unsafe_allow_html=True)
    
    items = load_items()
    tasks = load_tasks()
    logs = load_logs()
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Items", len(items))
    with col2:
        st.metric("Tasks", len(tasks))
    with col3:
        st.metric("Completions", len(logs))
    
    st.markdown("---")
    st.markdown("#### Export Data")
    
    if st.button("Download Backup (JSON)"):
        data = {"items": items, "tasks": tasks, "logs": logs, "exported_at": datetime.now().isoformat()}
        st.download_button(
            "Download",
            data=json.dumps(data, indent=2),
            file_name="maintenance_minder_backup.json",
            mime="application/json"
        )
    
    st.markdown("---")
    st.markdown("#### Danger Zone")
    
    if st.button("Clear All Data"):
        save_items([])
        save_tasks([])
        save_logs([])
        st.success("All data cleared.")
        st.rerun()

# ============================================
# ROUTER
# ============================================
page = st.session_state.page

if page == 'dashboard':
    show_dashboard()
elif page == 'items':
    show_items()
elif page == 'add_item':
    show_add_item()
elif page == 'add_task':
    show_add_task()
elif page == 'edit_task':
    show_edit_task()
elif page == 'update_mileage':
    show_update_mileage()
elif page == 'tasks':
    show_tasks()
elif page == 'settings':
    show_settings()
else:
    show_dashboard()
