import models
from database import SessionLocal, engine
from auth import hash_password
from datetime import datetime, timedelta

def seed():
    db = SessionLocal()
    
    # Create all tables
    models.Base.metadata.create_all(bind=engine)

    # Check if we already have users
    if db.query(models.User).first():
        print("Database already seeded.")
        return

    print("Seeding database...")

    # 1. Create Users
    ceo = models.User(
        name="Core Lead",
        email="core@elyndor.com",
        hashed_password=hash_password("elyndor123"),
        role="core_team",
        department="Executive",
        avatar_initials="M"
    )
    
    intern1 = models.User(
        name="Arjun Mehta",
        email="arjun@elyndor.com",
        hashed_password=hash_password("intern123"),
        role="intern",
        department="Development",
        avatar_initials="AM"
    )
    
    intern2 = models.User(
        name="Sarah Chen",
        email="sarah@elyndor.com",
        hashed_password=hash_password("intern123"),
        role="intern",
        department="Design",
        avatar_initials="SC"
    )

    db.add_all([ceo, intern1, intern2])
    db.commit()
    db.refresh(ceo)
    db.refresh(intern1)
    db.refresh(intern2)

    # 2. Create Clients
    client1 = models.Client(
        name="Epic Games",
        email="contact@epicgames.com",
        status=models.ClientStatus.ACTIVE,
        industry="Gaming",
        notes="Strategic partnership for Kaali."
    )
    
    client2 = models.Client(
        name="Netflix Games",
        email="publishing@netflix.com",
        status=models.ClientStatus.ACTIVE,
        industry="Entertainment",
        notes="Mobile port negotiations."
    )

    db.add_all([client1, client2])
    db.commit()
    db.refresh(client1)

    # 3. Create Projects
    p1 = models.Project(
        name="Kaali: A Mother's Tale",
        description="Epic horror RPG based on Indian mythology.",
        project_type="Game",
        engine="Unreal Engine 5",
        status=models.ProjectStatus.ACTIVE,
        progress=65.0,
        deadline=datetime.now() + timedelta(days=120),
        client_id=client1.id
    )
    
    p2 = models.Project(
        name="Project X",
        description="Unannounced tactical shooter.",
        project_type="Game",
        engine="Unity",
        status=models.ProjectStatus.ACTIVE,
        progress=12.0,
        deadline=datetime.now() + timedelta(days=365)
    )

    db.add_all([p1, p2])
    db.commit()
    db.refresh(p1)

    # 4. Create Roles
    r1 = models.Role(
        title="Senior Unreal Developer",
        department="Engineering",
        status=models.RoleStatus.OPEN,
        slots_required=2,
        slots_filled=1,
        is_urgent=True,
        project_id=p1.id
    )
    
    r2 = models.Role(
        title="Concept Artist",
        department="Art",
        status=models.RoleStatus.OPEN,
        slots_required=1,
        slots_filled=0,
        is_urgent=False,
        project_id=p1.id
    )

    db.add_all([r1, r2])
    db.commit()

    # 5. Create Performance Records
    perf1 = models.Performance(
        user_id=intern1.id,
        zone=models.PerformanceZone.GREEN,
        score=92.5,
        notes="Excellent progress on Kaali inventory system."
    )
    
    perf2 = models.Performance(
        user_id=intern2.id,
        zone=models.PerformanceZone.RED,
        score=45.0,
        notes="Struggling with deadline consistency."
    )

    db.add_all([perf1, perf2])
    db.commit()

    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    seed()
