#!/usr/bin/env python3
"""
🔧 Maintenance Minder Pro (Web Edition)
Track maintenance for your cars, home, and appliances.
Never forget another oil change, filter replacement, or service task.
"""

import streamlit as st
import json
from datetime import datetime, timedelta
from pathlib import Path
import uuid

st.set_page_config(
    page_title="Maintenance Minder Pro",
    page_icon="🔧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================
# CUSTOM CSS
# ============================================
st.markdown("""
<style>
    .stApp {
        background-color: #0F172A;
    }
    .metric-card {
        background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        border: 1px solid #475569;
    }
    .metric-value {
        font-size: 32px;
        font-weight: bold;
        color: #F8FAFC;
    }
    .metric-label {
        font-size: 14px;
        color: #94A3B8;
        margin-top: 4px;
    }
    .item-card {
        background: #1E293B;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        border-left: 4px solid #6366F1;
    }
    .task-card {
        background: #1E293B;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 8px;
    }
    .overdue {
        border-left: 4px solid #EF4444 !important;
    }
    .due-soon {
        border-left: 4px solid #F59E0B !important;
    }
    .on-track {
        border-left: 4px solid #10B981 !important;
    }
    .priority-critical { color: #EF4444; }
    .priority-high { color: #F97316; }
    .priority-medium { color: #F59E0B; }
    .priority-low { color: #10B981; }
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

def load_items():
    return load_json(ITEMS_FILE, [])

def save_items(items):
    save_json(ITEMS_FILE, items)

def load_tasks():
    return load_json(TASKS_FILE, [])

def save_tasks(tasks):
    save_json(TASKS_FILE, tasks)

def load_logs():
    return load_json(LOGS_FILE, [])

def save_logs(logs):
    save_json(LOGS_FILE, logs)

# ============================================
# MAINTENANCE TEMPLATES
# ============================================
TEMPLATES = {
    "car": [
        {"name": "Oil Change", "interval_days": 90, "priority": "high"},
        {"name": "Tire Rotation", "interval_days": 180, "priority": "medium"},
        {"name": "Air Filter", "interval_days": 365, "priority": "low"},
        {"name": "Brake Inspection", "interval_days": 365, "priority": "high"},
        {"name": "Battery Check", "interval_days": 365, "priority": "medium"},
        {"name": "Wiper Blades", "interval_days": 180, "priority": "low"},
    ],
    "home": [
        {"name": "HVAC Filter", "interval_days": 90, "priority": "high"},
        {"name": "Smoke Detector Batteries", "interval_days": 180, "priority": "critical"},
        {"name": "Gutter Cleaning", "interval_days": 180, "priority": "medium"},
        {"name": "Water Heater Flush", "interval_days": 365, "priority": "medium"},
        {"name": "Dryer Vent Cleaning", "interval_days": 365, "priority": "high"},
        {"name": "Pest Control", "interval_days": 90, "priority": "medium"},
    ],
    "appliance": [
        {"name": "Refrigerator Coils", "interval_days": 180, "priority": "medium"},
        {"name": "Dishwasher Filter", "interval_days": 30, "priority": "low"},
        {"name": "Washing Machine Clean", "interval_days": 30, "priority": "low"},
        {"name": "Oven Deep Clean", "interval_days": 90, "priority": "low"},
    ],
}

ITEM_ICONS = {"car": "🚗", "home": "🏠", "appliance": "🔌", "other": "📦"}
PRIORITY_COLORS = {"critical": "#EF4444", "high": "#F97316", "medium": "#F59E0B", "low": "#10B981"}

# ============================================
# HELPER FUNCTIONS
# ============================================
def generate_id():
    return str(uuid.uuid4())[:8]

def days_until_due(due_date_str):
    due = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).replace(tzinfo=None)
    return (due - datetime.now()).days

def get_status_class(days):
    if days < 0:
        return "overdue"
    elif days <= 7:
        return "due-soon"
    return "on-track"

def get_status_text(days):
    if days < 0:
        return f"⚠️ {abs(days)} days overdue"
    elif days == 0:
        return "📅 Due today"
    elif days == 1:
        return "📅 Due tomorrow"
    elif days <= 7:
        return f"⏰ Due in {days} days"
    return f"✅ Due in {days} days"

# ============================================
# MAIN APP
# ============================================
def main():
    st.sidebar.title("🔧 Maintenance Minder")
    
    page = st.sidebar.selectbox(
        "Navigate",
        ["📊 Dashboard", "📦 My Items", "✅ Tasks", "📅 Calendar", "➕ Add Item", "⚙️ Settings"]
    )
    
    if page == "📊 Dashboard":
        show_dashboard()
    elif page == "📦 My Items":
        show_items()
    elif page == "✅ Tasks":
        show_tasks()
    elif page == "📅 Calendar":
        show_calendar()
    elif page == "➕ Add Item":
        show_add_item()
    elif page == "⚙️ Settings":
        show_settings()

def show_dashboard():
    st.title("📊 Dashboard")
    st.caption("Your maintenance overview")
    
    items = load_items()
    tasks = load_tasks()
    
    # Calculate stats
    total_items = len(items)
    active_tasks = [t for t in tasks if t.get('is_active', True)]
    overdue = [t for t in active_tasks if days_until_due(t['next_due']) < 0]
    due_soon = [t for t in active_tasks if 0 <= days_until_due(t['next_due']) <= 7]
    
    # Stats row
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{total_items}</div>
            <div class="metric-label">📦 Items Tracked</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{len(active_tasks)}</div>
            <div class="metric-label">✅ Active Tasks</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value" style="color: #EF4444;">{len(overdue)}</div>
            <div class="metric-label">⚠️ Overdue</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value" style="color: #F59E0B;">{len(due_soon)}</div>
            <div class="metric-label">⏰ Due Soon</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Overdue tasks
    if overdue:
        st.subheader("⚠️ Overdue Tasks")
        for task in sorted(overdue, key=lambda t: t['next_due']):
            item = next((i for i in items if i['id'] == task['item_id']), None)
            item_name = item['name'] if item else "Unknown"
            days = days_until_due(task['next_due'])
            
            col1, col2, col3 = st.columns([3, 2, 1])
            with col1:
                st.markdown(f"**{task['name']}** - {item_name}")
            with col2:
                st.markdown(f"<span style='color: #EF4444;'>{abs(days)} days overdue</span>", unsafe_allow_html=True)
            with col3:
                if st.button("✅ Done", key=f"complete_{task['id']}"):
                    complete_task(task['id'])
                    st.rerun()
    
    # Due soon
    if due_soon:
        st.subheader("⏰ Due This Week")
        for task in sorted(due_soon, key=lambda t: t['next_due']):
            item = next((i for i in items if i['id'] == task['item_id']), None)
            item_name = item['name'] if item else "Unknown"
            days = days_until_due(task['next_due'])
            
            col1, col2, col3 = st.columns([3, 2, 1])
            with col1:
                st.markdown(f"**{task['name']}** - {item_name}")
            with col2:
                st.markdown(get_status_text(days))
            with col3:
                if st.button("✅ Done", key=f"complete2_{task['id']}"):
                    complete_task(task['id'])
                    st.rerun()
    
    if not overdue and not due_soon:
        st.success("🎉 All caught up! No urgent tasks right now.")
    
    if total_items == 0:
        st.info("👋 Welcome! Add your first item to get started tracking maintenance.")
        if st.button("➕ Add Your First Item"):
            st.session_state['page'] = "➕ Add Item"
            st.rerun()

def show_items():
    st.title("📦 My Items")
    
    items = load_items()
    tasks = load_tasks()
    
    if not items:
        st.info("No items yet. Add your first car, home, or appliance!")
        if st.button("➕ Add Item"):
            st.session_state['page'] = "➕ Add Item"
            st.rerun()
        return
    
    # Group by type
    grouped = {}
    for item in items:
        t = item.get('type', 'other')
        if t not in grouped:
            grouped[t] = []
        grouped[t].append(item)
    
    for item_type, type_items in grouped.items():
        icon = ITEM_ICONS.get(item_type, "📦")
        st.subheader(f"{icon} {item_type.title()}s")
        
        for item in type_items:
            item_tasks = [t for t in tasks if t['item_id'] == item['id'] and t.get('is_active', True)]
            next_task = min(item_tasks, key=lambda t: t['next_due']) if item_tasks else None
            
            with st.expander(f"**{item['name']}** - {item.get('brand', '')} {item.get('model', '')}"):
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    st.write(f"**Type:** {item_type.title()}")
                    if item.get('brand'):
                        st.write(f"**Brand:** {item['brand']}")
                    if item.get('notes'):
                        st.write(f"**Notes:** {item['notes']}")
                    st.write(f"**Tasks:** {len(item_tasks)} active")
                
                with col2:
                    if next_task:
                        days = days_until_due(next_task['next_due'])
                        st.write(f"**Next:** {next_task['name']}")
                        st.markdown(get_status_text(days))
                    else:
                        st.write("No upcoming tasks")
                
                # Task list
                if item_tasks:
                    st.markdown("**Maintenance Schedule:**")
                    for task in sorted(item_tasks, key=lambda t: t['next_due']):
                        days = days_until_due(task['next_due'])
                        status = get_status_text(days)
                        priority_color = PRIORITY_COLORS.get(task.get('priority', 'medium'), '#F59E0B')
                        st.markdown(f"- <span style='color: {priority_color};'>●</span> {task['name']} - {status}", unsafe_allow_html=True)
                
                # Actions
                col1, col2 = st.columns(2)
                with col1:
                    if st.button("🗑️ Delete Item", key=f"del_{item['id']}"):
                        delete_item(item['id'])
                        st.rerun()
                with col2:
                    if st.button("➕ Add Task", key=f"addtask_{item['id']}"):
                        st.session_state['add_task_item'] = item['id']
                        st.rerun()

def show_tasks():
    st.title("✅ All Tasks")
    
    items = load_items()
    tasks = load_tasks()
    
    if not tasks:
        st.info("No tasks yet. Add items to create maintenance tasks.")
        return
    
    # Filter
    filter_option = st.selectbox("Filter", ["All", "Overdue", "Due This Week", "Upcoming"])
    
    active_tasks = [t for t in tasks if t.get('is_active', True)]
    
    if filter_option == "Overdue":
        filtered = [t for t in active_tasks if days_until_due(t['next_due']) < 0]
    elif filter_option == "Due This Week":
        filtered = [t for t in active_tasks if 0 <= days_until_due(t['next_due']) <= 7]
    elif filter_option == "Upcoming":
        filtered = [t for t in active_tasks if days_until_due(t['next_due']) > 7]
    else:
        filtered = active_tasks
    
    for task in sorted(filtered, key=lambda t: t['next_due']):
        item = next((i for i in items if i['id'] == task['item_id']), None)
        item_name = item['name'] if item else "Unknown"
        days = days_until_due(task['next_due'])
        status_class = get_status_class(days)
        priority_color = PRIORITY_COLORS.get(task.get('priority', 'medium'), '#F59E0B')
        
        st.markdown(f"""
        <div class="task-card {status_class}">
            <strong style="color: {priority_color};">●</strong> <strong>{task['name']}</strong><br>
            <small>📦 {item_name} | {get_status_text(days)}</small>
        </div>
        """, unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns([1, 1, 4])
        with col1:
            if st.button("✅ Complete", key=f"comp_{task['id']}"):
                complete_task(task['id'])
                st.rerun()
        with col2:
            if st.button("🗑️ Delete", key=f"deltask_{task['id']}"):
                delete_task(task['id'])
                st.rerun()

def show_calendar():
    st.title("📅 Calendar View")
    
    tasks = load_tasks()
    items = load_items()
    
    if not tasks:
        st.info("No tasks to display.")
        return
    
    # Get tasks for the next 30 days
    today = datetime.now().date()
    
    for i in range(30):
        day = today + timedelta(days=i)
        day_tasks = [t for t in tasks if t.get('is_active', True) and 
                     datetime.fromisoformat(t['next_due'].replace('Z', '+00:00')).date() == day]
        
        if day_tasks:
            if i == 0:
                st.subheader(f"📅 Today - {day.strftime('%B %d')}")
            elif i == 1:
                st.subheader(f"📅 Tomorrow - {day.strftime('%B %d')}")
            else:
                st.subheader(f"📅 {day.strftime('%A, %B %d')}")
            
            for task in day_tasks:
                item = next((i for i in items if i['id'] == task['item_id']), None)
                item_name = item['name'] if item else "Unknown"
                st.write(f"- **{task['name']}** ({item_name})")

def show_add_item():
    st.title("➕ Add New Item")
    
    with st.form("add_item_form"):
        name = st.text_input("Item Name *", placeholder="e.g., My Honda Accord")
        
        item_type = st.selectbox("Type *", ["car", "home", "appliance", "other"])
        
        col1, col2 = st.columns(2)
        with col1:
            brand = st.text_input("Brand", placeholder="e.g., Honda, Samsung")
        with col2:
            model = st.text_input("Model", placeholder="e.g., Accord, RF28R7551SR")
        
        notes = st.text_area("Notes", placeholder="Any additional notes...")
        
        add_templates = st.checkbox("Add recommended maintenance tasks", value=True)
        
        submitted = st.form_submit_button("💾 Add Item", use_container_width=True)
        
        if submitted:
            if not name:
                st.error("Please enter a name for this item")
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
                
                # Add template tasks
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
                
                st.success(f"✅ Added {name}!")
                st.balloons()

def show_settings():
    st.title("⚙️ Settings")
    
    items = load_items()
    tasks = load_tasks()
    logs = load_logs()
    
    st.subheader("📊 Data Summary")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Items", len(items))
    with col2:
        st.metric("Tasks", len(tasks))
    with col3:
        st.metric("Completed Logs", len(logs))
    
    st.markdown("---")
    
    st.subheader("📤 Export Data")
    if st.button("Download All Data (JSON)"):
        data = {
            "items": items,
            "tasks": tasks,
            "logs": logs,
            "exported_at": datetime.now().isoformat()
        }
        st.download_button(
            "📥 Download",
            data=json.dumps(data, indent=2, default=str),
            file_name="maintenance_minder_export.json",
            mime="application/json"
        )
    
    st.markdown("---")
    
    st.subheader("🗑️ Danger Zone")
    if st.button("🗑️ Clear All Data", type="secondary"):
        st.warning("⚠️ This will delete all your items, tasks, and logs!")
        if st.button("Yes, delete everything", type="primary"):
            save_items([])
            save_tasks([])
            save_logs([])
            st.success("All data cleared.")
            st.rerun()

# ============================================
# HELPER ACTIONS
# ============================================
def complete_task(task_id):
    tasks = load_tasks()
    logs = load_logs()
    
    for task in tasks:
        if task['id'] == task_id:
            # Log completion
            log = {
                "id": generate_id(),
                "task_id": task_id,
                "item_id": task['item_id'],
                "completed_at": datetime.now().isoformat()
            }
            logs.append(log)
            save_logs(logs)
            
            # Reschedule task
            if task.get('interval_days', 0) > 0:
                task['next_due'] = (datetime.now() + timedelta(days=task['interval_days'])).isoformat()
                task['last_completed'] = datetime.now().isoformat()
            break
    
    save_tasks(tasks)

def delete_item(item_id):
    items = load_items()
    tasks = load_tasks()
    
    items = [i for i in items if i['id'] != item_id]
    tasks = [t for t in tasks if t['item_id'] != item_id]
    
    save_items(items)
    save_tasks(tasks)

def delete_task(task_id):
    tasks = load_tasks()
    tasks = [t for t in tasks if t['id'] != task_id]
    save_tasks(tasks)

if __name__ == "__main__":
    main()
