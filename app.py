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
# MAINTENANCE TEMPLATES - WITH MILES/DAYS
# ============================================
TEMPLATES = {
    "vehicle": [
        {"name": "Oil Change", "interval": 90, "unit": "days", "alt_interval": 3000, "alt_unit": "miles", "priority": "high"},
        {"name": "Tire Rotation", "interval": 180, "unit": "days", "alt_interval": 5000, "alt_unit": "miles", "priority": "medium"},
        {"name": "Air Filter Replacement", "interval": 365, "unit": "days", "alt_interval": 15000, "alt_unit": "miles", "priority": "low"},
        {"name": "Brake Inspection", "interval": 365, "unit": "days", "alt_interval": 12000, "alt_unit": "miles", "priority": "high"},
        {"name": "Transmission Fluid", "interval": 730, "unit": "days", "alt_interval": 30000, "alt_unit": "miles", "priority": "medium"},
        {"name": "Coolant Flush", "interval": 730, "unit": "days", "alt_interval": 30000, "alt_unit": "miles", "priority": "medium"},
        {"name": "Battery Check", "interval": 365, "unit": "days", "alt_interval": None, "alt_unit": None, "priority": "medium"},
        {"name": "Wiper Blades", "interval": 180, "unit": "days", "alt_interval": None, "alt_unit": None, "priority": "low"},
    ],
    "home": [
        {"name": "HVAC Filter Change", "interval": 90, "unit": "days", "priority": "high"},
        {"name": "Smoke Detector Test", "interval": 30, "unit": "days", "priority": "critical"},
        {"name": "Smoke Detector Batteries", "interval": 180, "unit": "days", "priority": "critical"},
        {"name": "Gutter Cleaning", "interval": 180, "unit": "days", "priority": "medium"},
        {"name": "Water Heater Flush", "interval": 365, "unit": "days", "priority": "medium"},
        {"name": "Dryer Vent Cleaning", "interval": 365, "unit": "days", "priority": "high"},
        {"name": "Pest Control", "interval": 90, "unit": "days", "priority": "medium"},
    ],
    "appliance": [
        {"name": "Deep Clean", "interval": 90, "unit": "days", "priority": "low"},
        {"name": "Filter Replacement", "interval": 180, "unit": "days", "priority": "medium"},
        {"name": "Maintenance Check", "interval": 365, "unit": "days", "priority": "medium"},
    ],
}

# ============================================
# HELPER FUNCTIONS
# ============================================
def generate_id():
    return str(uuid.uuid4())[:8]

def days_until_due(task):
    """Calculate days until due. For mileage-based tasks, this is an estimate."""
    try:
        due_date = task.get('next_due_date')
        if due_date:
            due = datetime.fromisoformat(due_date.replace('Z', '+00:00')).replace(tzinfo=None)
            return (due - datetime.now()).days
        return 999
    except:
        return 999

def get_status_class(days):
    if days < 0: return "overdue"
    elif days <= 7: return "soon"
    return "ok"

def get_status_text(task):
    """Get status text based on task unit type."""
    unit = task.get('unit', 'days')
    
    if unit == 'miles':
        current = task.get('current_mileage', 0)
        due_at = task.get('due_at_mileage', 0)
        remaining = due_at - current
        if remaining <= 0:
            return f"{abs(remaining):,} miles overdue"
        elif remaining <= 500:
            return f"{remaining:,} miles remaining"
        else:
            return f"{remaining:,} miles until due"
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
            return f"Due in {days} days"
        else:
            return f"Due in {days} days"

def is_overdue(task):
    """Check if task is overdue based on its unit type."""
    unit = task.get('unit', 'days')
    if unit == 'miles':
        current = task.get('current_mileage', 0)
        due_at = task.get('due_at_mileage', 0)
        return current >= due_at
    else:
        return days_until_due(task) < 0

def is_due_soon(task):
    """Check if task is due soon."""
    unit = task.get('unit', 'days')
    if unit == 'miles':
        current = task.get('current_mileage', 0)
        due_at = task.get('due_at_mileage', 0)
        remaining = due_at - current
        return 0 < remaining <= 500
    else:
        days = days_until_due(task)
        return 0 <= days <= 7

def calculate_next_due(last_date_str, interval_days):
    """Calculate next due date from last completed date."""
    if last_date_str:
        last = datetime.fromisoformat(last_date_str)
        return (last + timedelta(days=interval_days)).isoformat()
    return (datetime.now() + timedelta(days=interval_days)).isoformat()

def complete_task(task_id):
    tasks = load_tasks()
    logs = load_logs()
    
    for task in tasks:
        if task['id'] == task_id:
            now = datetime.now()
            
            # Log completion
            log = {
                "id": generate_id(),
                "task_id": task_id,
                "item_id": task['item_id'],
                "completed_at": now.isoformat(),
                "mileage": task.get('current_mileage')
            }
            logs.append(log)
            save_logs(logs)
            
            # Update task
            task['last_completed'] = now.isoformat()
            
            if task.get('unit') == 'miles':
                current = task.get('current_mileage', 0)
                interval = task.get('interval', 3000)
                task['due_at_mileage'] = current + interval
            else:
                interval = task.get('interval', 90)
                task['next_due_date'] = (now + timedelta(days=interval)).isoformat()
            
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
# NAVIGATION
# ============================================
if 'page' not in st.session_state:
    st.session_state.page = 'dashboard'

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
    
    # ALWAYS show Add New Item button
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
        st.success("You're all caught up. No urgent maintenance tasks.")
    
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
    
    # Add Item button at top
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
        
        type_class = f"type-{item.get('type', 'other')}"
        
        with st.expander(f"**{item['name']}** — {item.get('brand', '')} {item.get('model', '')}".strip(), expanded=False):
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.markdown(f'<span class="type-badge {type_class}">{item.get("type", "other")}</span>', unsafe_allow_html=True)
                if item.get('notes'):
                    st.caption(item['notes'])
                
                # Show current mileage for vehicles
                if item.get('type') == 'vehicle' and item.get('current_mileage'):
                    st.markdown(f"**Current Mileage:** {item['current_mileage']:,} miles")
            
            with col2:
                st.markdown(f"**{len(item_tasks)}** tasks")
                if overdue_count > 0:
                    st.markdown(f'<span class="status-overdue">{overdue_count} overdue</span>', unsafe_allow_html=True)
            
            st.markdown("---")
            
            # Task list with edit capability
            if item_tasks:
                for task in sorted(item_tasks, key=lambda t: (not is_overdue(t), not is_due_soon(t))):
                    priority = task.get('priority', 'medium')
                    unit = task.get('unit', 'days')
                    interval = task.get('interval', 90)
                    
                    tcol1, tcol2, tcol3, tcol4 = st.columns([3, 2, 1, 1])
                    with tcol1:
                        st.markdown(f'<span class="priority-dot priority-{priority}"></span> **{task["name"]}**', unsafe_allow_html=True)
                        unit_text = f"Every {interval:,} {unit}"
                        st.caption(unit_text)
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
            
            col1, col2, col3 = st.columns(3)
            with col1:
                if st.button("Add Task", key=f"add_task_{item['id']}", use_container_width=True):
                    navigate('add_task', add_task_item_id=item['id'])
                    st.rerun()
            with col2:
                if item.get('type') == 'vehicle':
                    if st.button("Update Mileage", key=f"mileage_{item['id']}", use_container_width=True):
                        navigate('update_mileage', mileage_item_id=item['id'])
                        st.rerun()
            with col3:
                if st.button("Delete", key=f"del_{item['id']}", use_container_width=True):
                    delete_item(item['id'])
                    st.rerun()

def show_add_item():
    st.markdown('<div class="page-title">Add New Item</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Track a new vehicle, home, or appliance</div>', unsafe_allow_html=True)
    
    with st.form("add_item_form"):
        name = st.text_input("Name", placeholder="e.g., 2020 Honda Accord, Main House, Kitchen Refrigerator")
        
        item_type = st.selectbox("Type", ["vehicle", "home", "appliance"])
        
        col1, col2 = st.columns(2)
        with col1:
            brand = st.text_input("Brand (optional)", placeholder="e.g., Honda, Samsung, Carrier")
        with col2:
            model = st.text_input("Model (optional)", placeholder="e.g., Accord, RF28R, XR15")
        
        # Vehicle-specific fields
        current_mileage = None
        if item_type == "vehicle":
            st.markdown("---")
            st.markdown("**Vehicle Details**")
            current_mileage = st.number_input("Current Mileage", min_value=0, value=0, step=100)
        
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
                
                if item_type == "vehicle" and current_mileage:
                    item['current_mileage'] = current_mileage
                
                items = load_items()
                items.append(item)
                save_items(items)
                
                # Add template tasks
                if add_templates and item_type in TEMPLATES:
                    tasks = load_tasks()
                    for template in TEMPLATES[item_type]:
                        # Determine unit - for vehicles, prefer miles for applicable tasks
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
                        
                        # Set due date/mileage
                        if unit == 'miles' and current_mileage:
                            task['current_mileage'] = current_mileage
                            task['due_at_mileage'] = current_mileage + interval
                        else:
                            task['next_due_date'] = (datetime.now() + timedelta(days=interval)).isoformat()
                        
                        # Store alt values for vehicles
                        if template.get('alt_interval'):
                            task['alt_interval'] = template['alt_interval']
                            task['alt_unit'] = template['alt_unit']
                        
                        tasks.append(task)
                    save_tasks(tasks)
                
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
    
    st.markdown(f'<div class="page-title">Add Task</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="page-subtitle">Add maintenance task for {item["name"]}</div>', unsafe_allow_html=True)
    
    with st.form("add_task_form"):
        name = st.text_input("Task Name", placeholder="e.g., Oil Change, Filter Replacement")
        
        col1, col2 = st.columns(2)
        with col1:
            # Unit selection
            if item.get('type') == 'vehicle':
                unit = st.selectbox("Track by", ["days", "miles"])
            else:
                unit = "days"
                st.text_input("Track by", value="Days", disabled=True)
        
        with col2:
            if unit == "miles":
                interval = st.number_input("Interval (miles)", min_value=100, value=3000, step=500)
            else:
                interval = st.number_input("Interval (days)", min_value=1, value=90, step=1)
        
        priority = st.selectbox("Priority", ["low", "medium", "high", "critical"])
        
        st.markdown("---")
        st.markdown("**When was this last done?**")
        
        col1, col2 = st.columns(2)
        with col1:
            last_completed_option = st.radio(
                "Last completed",
                ["Never / Not sure", "Enter date"],
                horizontal=True
            )
        
        last_date = None
        last_mileage = None
        
        if last_completed_option == "Enter date":
            with col2:
                last_date = st.date_input("Last completed date", value=datetime.now().date())
        
        if unit == "miles":
            last_mileage = st.number_input(
                "Mileage at last service (optional)",
                min_value=0,
                value=item.get('current_mileage', 0),
                step=100
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
                
                # Calculate next due
                if unit == "miles":
                    current = item.get('current_mileage', 0)
                    if last_mileage and last_mileage > 0:
                        task['due_at_mileage'] = last_mileage + interval
                        task['last_completed_mileage'] = last_mileage
                    else:
                        task['due_at_mileage'] = current + interval
                    task['current_mileage'] = current
                else:
                    if last_date and last_completed_option == "Enter date":
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
    
    st.markdown(f'<div class="page-title">Edit Task</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="page-subtitle">Editing {task["name"]} for {item["name"] if item else "Unknown"}</div>', unsafe_allow_html=True)
    
    with st.form("edit_task_form"):
        name = st.text_input("Task Name", value=task['name'])
        
        col1, col2 = st.columns(2)
        with col1:
            current_unit = task.get('unit', 'days')
            if item and item.get('type') == 'vehicle':
                unit = st.selectbox("Track by", ["days", "miles"], index=0 if current_unit == "days" else 1)
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
        st.markdown("**Update last completed**")
        
        update_last = st.checkbox("Update last completed date/mileage")
        
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
            # Update task
            task['name'] = name
            task['interval'] = interval
            task['unit'] = unit
            task['priority'] = priority
            
            # Recalculate due date/mileage
            if update_last:
                if unit == "miles" and item:
                    task['due_at_mileage'] = last_mileage + interval
                    task['last_completed_mileage'] = last_mileage
                    task['current_mileage'] = item.get('current_mileage', 0)
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
    st.markdown(f"**Current mileage:** {current:,} miles")
    
    with st.form("mileage_form"):
        new_mileage = st.number_input("New Mileage", min_value=current, value=current, step=100)
        
        submitted = st.form_submit_button("Update", use_container_width=True)
        
        if submitted:
            # Update item mileage
            item['current_mileage'] = new_mileage
            save_items(items)
            
            # Update all mileage-based tasks for this item
            tasks = load_tasks()
            for task in tasks:
                if task['item_id'] == item_id and task.get('unit') == 'miles':
                    task['current_mileage'] = new_mileage
            save_tasks(tasks)
            
            st.success(f"Mileage updated to {new_mileage:,} miles!")
            navigate('items')
            st.rerun()
    
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
    
    # Sort: overdue first, then due soon, then by date
    filtered = sorted(filtered, key=lambda t: (not is_overdue(t), not is_due_soon(t), t.get('next_due_date', '9999')))
    
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
        st.metric("Completed", len(logs))
    
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
