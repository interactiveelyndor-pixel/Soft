from database import engine
import models

def reset_database():
    print("⚠️  WARNING: This will wipe ALL profiles and data.")
    confirm = input("Are you sure? (y/N): ")
    if confirm.lower() != 'y':
        print("Operation cancelled.")
        return

    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=engine)
    
    print("Recreating tables...")
    models.Base.metadata.create_all(bind=engine)
    
    print("✅ Database has been wiped and reset. System is now clean for deployment.")

if __name__ == "__main__":
    reset_database()
