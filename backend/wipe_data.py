from database import engine
import models

def wipe_database():
    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=engine)
    
    print("Recreating tables...")
    models.Base.metadata.create_all(bind=engine)
    
    print("Database has been wiped and reset. All test data removed.")

if __name__ == "__main__":
    wipe_database()
