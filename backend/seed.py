import os
import sys
from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal, engine, Base
from app.db.mongo import get_mongo_db
from app.models.sql_models import (
    Officer, Case, Person, Organization, Vehicle, Device, Location, Evidence,
    EvidenceCustody, CaseActivity,
    case_people, case_organizations, case_vehicles, case_devices, case_locations,
    person_organizations, person_vehicles, person_devices,
    evidence_people, evidence_vehicles, evidence_devices, evidence_locations
)
from app.core.security import get_password_hash

def utc_now():
    return datetime.now(timezone.utc)

def seed_sql_database(db):
    print("Clearing prior SQL demonstration records...")
    db.execute(evidence_locations.delete())
    db.execute(evidence_devices.delete())
    db.execute(evidence_vehicles.delete())
    db.execute(evidence_people.delete())
    db.execute(person_devices.delete())
    db.execute(person_vehicles.delete())
    db.execute(person_organizations.delete())
    db.execute(case_locations.delete())
    db.execute(case_devices.delete())
    db.execute(case_vehicles.delete())
    db.execute(case_organizations.delete())
    db.execute(case_people.delete())
    db.query(CaseActivity).delete()
    db.query(EvidenceCustody).delete()
    db.query(Evidence).delete()
    db.query(Case).delete()
    db.query(Person).delete()
    db.query(Organization).delete()
    db.query(Vehicle).delete()
    db.query(Device).delete()
    db.query(Location).delete()
    db.query(Officer).delete()
    db.commit()

    # 1. Seed 5 Officers
    print("Seeding Officers...")
    admin_pwd = get_password_hash("Admin@123")
    inv_pwd = get_password_hash("Investigator@123")
    default_pwd = get_password_hash("password123")
    officers = [
        Officer(
            officer_id="OFF-001", full_name="Administrator Rajesh Sharma", badge_number="CID-001",
            department="Special Cyber & Intelligence Fusion Command", contact_email="admin@fusion.gov.in",
            role="ADMIN", account_status="Active", hashed_password=admin_pwd
        ),
        Officer(
            officer_id="OFF-002", full_name="Lead Inspector Ananya Roy", badge_number="CID-002",
            department="Major Crimes & Cross-Border Investigations", contact_email="investigator@fusion.gov.in",
            role="INVESTIGATOR", account_status="Active", hashed_password=inv_pwd
        ),
        Officer(
            officer_id="OFF-003", full_name="Officer Vikram Malhotra", badge_number="B-3829",
            department="Tactical Field Operations", contact_email="vikram.malhotra@fusion.gov.in",
            role="INVESTIGATOR", account_status="Active", hashed_password=default_pwd
        ),
        Officer(
            officer_id="OFF-004", full_name="Forensic Specialist Sunita Rao", badge_number="B-6701",
            department="Digital & Physical Forensics Lab", contact_email="sunita.rao@fusion.gov.in",
            role="INVESTIGATOR", account_status="Active", hashed_password=default_pwd
        ),
        Officer(
            officer_id="OFF-005", full_name="Sergeant Arvind Patil", badge_number="B-2244",
            department="Evidence Control & Vault Management", contact_email="arvind.patil@fusion.gov.in",
            role="INVESTIGATOR", account_status="Active", hashed_password=default_pwd
        ),
    ]
    db.add_all(officers)
    db.commit()

    # 2. Seed 15 People
    print("Seeding Persons of Interest, Witnesses, and Subjects...")
    people = [
        Person(person_id="PER-001", full_name="Karan Varma", date_of_birth="1988-04-12", contact_details="+91 98765 43210", address="Flat 4B, Silver Heights, Koramangala, Bengaluru", category="Subject", description="Alleged primary broker in syndicated luxury vehicle thefts and counterfeit registration tags."),
        Person(person_id="PER-002", full_name="Dr. Meera Nambiar", date_of_birth="1975-11-23", contact_details="+91 98111 22334", address="Villa 12, Palm Meadows, Whitefield, Bengaluru", category="Reporting Party", description="Chief Financial Officer who detected anomalous wire transfers and filed the initial corporate embezzlement complaint."),
        Person(person_id="PER-003", full_name="Devendra 'Dev' Joshi", date_of_birth="1992-08-05", contact_details="+91 97234 56789", address="Quarter 31, Railway Colony, Yeshwanthpur, Bengaluru", category="Subject", description="Specialist hardware modder implicated in spoofing automotive CAN-bus controllers and cloning smart keys."),
        Person(person_id="PER-004", full_name="Pooja Kulkarni", date_of_birth="1996-02-17", contact_details="+91 94455 66778", address="22/1, 10th Cross, Indiranagar, Bengaluru", category="Witness", description="Valet supervisor at Grand Azure Hotel who observed suspect vehicle swap on night of incident."),
        Person(person_id="PER-005", full_name="Sameer Qureshi", date_of_birth="1984-06-30", contact_details="+91 93322 11445", address="Industrial Shed 14, Peenya Stage 2, Bengaluru", category="Subject", description="Proprietor of Apex Auto Bodyworks, suspected of altering chassis stamping and repainting stolen cars."),
        Person(person_id="PER-006", full_name="Naveen Hegde", date_of_birth="1990-10-14", contact_details="+91 91234 88990", address="Skyline Towers, Electronic City Phase 1, Bengaluru", category="Subject", description="Senior Cloud Infrastructure Administrator accused of exfiltrating cryptographic API keys."),
        Person(person_id="PER-007", full_name="Arjun Singhania", date_of_birth="1970-01-19", contact_details="+91 99000 11223", address="Singhania Estate, Sadashivanagar, Bengaluru", category="Witness", description="Owner of registered classic sedan targeted in attempted garage break-in."),
        Person(person_id="PER-008", full_name="Farhan Akhtar Khan", date_of_birth="1994-09-08", contact_details="+91 97788 33221", address="Benson Town, Bengaluru", category="Witness", description="Telecommunication fiber splicer who witnessed unauthorized cabinet access at telecom exchange."),
        Person(person_id="PER-009", full_name="Sneha Sen", date_of_birth="1998-12-01", contact_details="+91 96655 44332", address="HSR Layout Sector 3, Bengaluru", category="Reporting Party", description="Cybersecurity compliance officer at Fintech Nexa who flagged suspicious AWS session tokens."),
        Person(person_id="PER-010", full_name="Harish Chandra", date_of_birth="1968-05-15", contact_details="+91 95544 33221", address="Commercial Street Commercial Complex, Bengaluru", category="Other", description="Licensed scrap metal and automotive parts dealer; provided parts register receipts."),
        Person(person_id="PER-011", full_name="Ritu Menon", date_of_birth="1991-03-29", contact_details="+91 94433 22110", address="Lavelle Road, Bengaluru", category="Witness", description="Branch manager at Union Horizon Bank who verified suspicious cashier checks."),
        Person(person_id="PER-012", full_name="Girish Babu", date_of_birth="1982-07-22", contact_details="+91 93311 00229", address="Kengeri Satellite Town, Bengaluru", category="Subject", description="Commercial logistics courier caught transporting falsified shipping containers."),
        Person(person_id="PER-013", full_name="Alok Tandon", date_of_birth="1987-11-11", contact_details="+91 92200 11998", address="Malleshwaram, Bengaluru", category="Other", description="Building security supervisor who provided backup hard disk footage."),
        Person(person_id="PER-014", full_name="Deepa Nair", date_of_birth="1995-04-03", contact_details="+91 91199 88776", address="BTM Layout 2nd Stage, Bengaluru", category="Witness", description="Night-shift receptionist who logged entry badge anomalies."),
        Person(person_id="PER-015", full_name="Sanjay Khurana", date_of_birth="1980-08-18", contact_details="+91 90088 77665", address="Richmond Town, Bengaluru", category="Subject", description="Managing Partner of Blue Horizon Logistics, investigated for routing illicit container shipments.")
    ]
    db.add_all(people)
    db.commit()

    # 3. Seed 6 Organizations
    print("Seeding Organizations...")
    orgs = [
        Organization(organization_id="ORG-001", name="Apex Auto Restorations & Bodyworks", organization_type="Automotive Repair / Garage", address="Plot 44, Peenya Industrial Area Phase 2, Bengaluru", contact_details="contact@apexautobody.demo", description="Custom paint and modification workshop flagged as suspected vehicle chop-shop."),
        Organization(organization_id="ORG-002", name="Fintech Nexa Capital Solutions", organization_type="Financial Services", address="Tower B, Prestige Tech Park, Marathahalli-Sarjapur Outer Ring Rd, Bengaluru", contact_details="security@nexacapital.demo", description="Corporate entity victimized by unauthorized high-frequency automated wire diversion."),
        Organization(organization_id="ORG-003", name="Blue Horizon Maritime Logistics", organization_type="Freight Forwarder", address="Container Terminal 3, Old Port Rd, Mangaluru / Bangalore ICD", contact_details="dispatch@bluehorizonlogistics.demo", description="Commercial logistics company holding freight clearance manifests for cross-border transit."),
        Organization(organization_id="ORG-004", name="OpticCore Telecom Infrastructures", organization_type="Telecommunications Provider", address="Vasanth Nagar, Bengaluru", contact_details="noc@opticcore.demo", description="Operator of regional dark fiber backbone nodes subject to physical line tapping."),
        Organization(organization_id="ORG-005", name="Grand Azure International Hotel", organization_type="Hospitality", address="Residency Road, Bengaluru", contact_details="frontdesk@grandazure.demo", description="High-end hotel location where vehicle exchange and confidential briefcase drop occurred."),
        Organization(organization_id="ORG-006", name="Vortex Microelectronics Lab", organization_type="Hardware Research Facility", address="KIADB Export Zone, Whitefield, Bengaluru", contact_details="info@vortexmicro.demo", description="Semiconductor testing firm where missing cryptographic microcontroller evaluation kits originated.")
    ]
    db.add_all(orgs)
    db.commit()

    # 4. Seed 8 Vehicles
    print("Seeding Vehicles...")
    vehicles = [
        Vehicle(vehicle_id="VEH-001", registration_number="KA-01-MJ-8821", make="BMW", model="530d M-Sport", color="Navy Blue", vehicle_type="Sedan", description="Fictional luxury sedan reported stolen from hotel valet; matched automated toll camera captures."),
        Vehicle(vehicle_id="VEH-002", registration_number="KA-04-EQ-4019", make="Toyota", model="Innova Crysta", color="Silver Metallic", vehicle_type="MPV", description="Support vehicle observed following target sedan on electronic expressway cameras."),
        Vehicle(vehicle_id="VEH-003", registration_number="KA-05-NB-1102", make="Mahindra", model="Bolero Maxi Truck", color="White", vehicle_type="Light Commercial Vehicle", description="Flatbed cargo truck registered to Apex Auto Bodyworks, used for transporting dismantled vehicle assemblies."),
        Vehicle(vehicle_id="VEH-004", registration_number="KA-03-PL-7744", make="Mercedes-Benz", model="E350", color="Obsidian Black", vehicle_type="Sedan", description="Corporate executive vehicle assigned to Fintech Nexa leadership."),
        Vehicle(vehicle_id="VEH-005", registration_number="KA-51-ZZ-9382", make="Hyundai", model="Verna 1.5 Turbo", color="Titan Grey", vehicle_type="Sedan", description="Personal vehicle of Devendra Joshi; contained hidden hardware programmer under passenger dash."),
        Vehicle(vehicle_id="VEH-006", registration_number="MH-02-CX-6631", make="Tata", model="Prima 4028.S", color="Dark Green", vehicle_type="Heavy Hauler Truck", description="Inter-state container carrier flagged at Nelamangala toll plaza carrying untaxed electronic scrap."),
        Vehicle(vehicle_id="VEH-007", registration_number="KA-02-GH-5510", make="Honda", model="City ZX", color="Platinum White", vehicle_type="Sedan", description="Witness vehicle equipped with 4K front/rear dual dashcam that recorded alley transfer."),
        Vehicle(vehicle_id="VEH-008", registration_number="KA-53-MA-3030", make="Skoda", model="Octavia vRS", color="Race Blue", vehicle_type="Sedan", description="Identified speed-run vehicle associated with nocturnal bypass races along Outer Ring Road.")
    ]
    db.add_all(vehicles)
    db.commit()

    # 5. Seed 8 Devices
    print("Seeding Devices...")
    devices = [
        Device(device_id="DEV-001", device_type="Automotive Key Programmer", manufacturer="Autel Diagnostics", model="MaxiIM IM608 Pro", serial_number="AUT-IM608-88392", description="Handheld tablet used to intercept transponder radio frequencies and flash blank key fobs."),
        Device(device_id="DEV-002", device_type="Encrypted Laptop", manufacturer="Lenovo ThinkPad", model="X1 Carbon Gen 11", serial_number="LNV-TP-992817", description="Contains partitioned Linux installation with scripts for automated Swift API payload injection."),
        Device(device_id="DEV-003", device_type="Hardware Security Token", manufacturer="Yubico", model="YubiKey 5C NFC", serial_number="YK5-8829104", description="Recovered hardware key used for privileged authentication to corporate cloud treasury vault."),
        Device(device_id="DEV-004", device_type="Fiber Optic OTDR Analyzer", manufacturer="EXFO", model="FTB-1v2 Pro", serial_number="EXF-OTDR-44019", description="Field optical time-domain reflectometer used to locate exact fiber splice attenuation coordinates."),
        Device(device_id="DEV-005", device_type="Smartphone", manufacturer="Apple", model="iPhone 14 Pro Max", serial_number="APP-IMEI-354928109283741", description="Seized from Karan Varma; encrypted Signal messenger logs and burner eSIM profiles identified."),
        Device(device_id="DEV-006", device_type="Standalone Network Video Recorder", manufacturer="Hikvision", model="DS-7616NI-Q2", serial_number="HIK-NVR-1928374", description="Building security recorder seized from commercial warehouse basement with 30 days stored feed."),
        Device(device_id="DEV-007", device_type="Microcontroller Development Board", manufacturer="STMicroelectronics", model="STM32H753ZI Nucleo", serial_number="STM-DEV-772910", description="Custom breadboard assembly configured as CAN-bus transceiver sniffing vehicle diagnostic port."),
        Device(device_id="DEV-008", device_type="Cold Storage Hardware Wallet", manufacturer="Ledger", model="Nano X", serial_number="LDG-NX-339102", description="Hardware cryptocurrency wallet recovered during warehouse raid; holds multi-sig escrow keys.")
    ]
    db.add_all(devices)
    db.commit()

    # 6. Seed 10 Locations
    print("Seeding Locations...")
    locations = [
        Location(location_id="LOC-001", name="Grand Azure Hotel Valet & Underground Parking", address="18 Residency Road, Ashok Nagar, Bengaluru - 560025", location_type="Hospitality / Parking", latitude=12.9716, longitude=77.6080, description="Site of primary luxury vehicle theft; subterranean CCTV blind spot identified near Pillar C-14."),
        Location(location_id="LOC-002", name="Apex Auto Works - Shed B", address="Plot 44, Peenya 2nd Stage, Peenya Industrial Area, Bengaluru - 560058", location_type="Industrial Workshop", latitude=13.0315, longitude=77.5142, description="Raid location where stolen BMW 530d was recovered undergoing chassis VIN restamping."),
        Location(location_id="LOC-003", name="Fintech Nexa Headquarters - Server Floor", address="Level 6, Block 3, Prestige Tech Park, Kadubeesanahalli, Bengaluru - 560103", location_type="Corporate Data Facility", latitude=12.9360, longitude=77.6934, description="Origin point of unauthorized wire diversion terminal sessions."),
        Location(location_id="LOC-004", name="OpticCore Manhole Junction MH-44", address="Opposite Golf Course Road Junction, Vasanth Nagar, Bengaluru - 560052", location_type="Utility Infrastructure", latitude=12.9912, longitude=77.5873, description="Subsurface telecommunications vault where physical optical fiber splitter was tapped."),
        Location(location_id="LOC-005", name="Nelamangala Toll Plaza - Outbound Express Lane", address="NH-48, Nelamangala Tollgate, Bengaluru Rural - 562123", location_type="Highway Checkpoint", latitude=13.1009, longitude=77.3879, description="Automated Number Plate Recognition (ANPR) checkpoint that logged false registration plate match."),
        Location(location_id="LOC-006", name="Inland Container Depot (ICD) Whitefield", address="Container Corporation Yard, Whitefield Railway Goods Shed, Bengaluru - 560066", location_type="Logistics Freight Yard", latitude=12.9926, longitude=77.7523, description="Customs bonded terminal where export container BHLU-982104 was intercepted."),
        Location(location_id="LOC-007", name="Koramangala Safehouse Apartment", address="Flat 4B, Silver Heights, 5th Block Koramangala, Bengaluru - 560095", location_type="Residential Residence", latitude=12.9352, longitude=77.6245, description="Search warrant execution site; seized burner phones, currency counters, and cloned RFID badges."),
        Location(location_id="LOC-008", name="Union Horizon Bank - MG Road Branch", address="45 MG Road, Shantala Nagar, Bengaluru - 560001", location_type="Financial Institution", latitude=12.9738, longitude=77.6119, description="Bank location where suspicious counter drafts and fraudulent cashier vouchers were presented."),
        Location(location_id="LOC-009", name="Outer Ring Road Bellandur Flyover Junction", address="Outer Ring Road, Bellandur, Bengaluru - 560103", location_type="Traffic Corridor", latitude=12.9298, longitude=77.6744, description="High-speed pursuit tracking point; suspect vehicle dropped electronic tracking transponder."),
        Location(location_id="LOC-010", name="Cyber Crime Police Station & Evidence Vault", address="CID Headquarters, Palace Road, Bengaluru - 560001", location_type="Government Facility", latitude=12.9833, longitude=77.5898, description="Primary centralized evidentiary lockup and digital forensic extraction suite.")
    ]
    db.add_all(locations)
    db.commit()

    # 7. Seed 8 Cases
    print("Seeding Cases...")
    now = utc_now()
    cases = [
        Case(
            case_id="CASE-2026-001",
            title="Operation Blue Mirage: Syndicated Luxury Vehicle & VIN Cloning Ring",
            description="Multi-jurisdiction investigation into the coordinated theft of European high-end sedans from five-star hotel valets, utilizing CAN-bus injection tools and counterfeit regional transport registration papers.",
            case_type="Organized Vehicle Theft",
            status="Under Investigation",
            priority="Critical",
            lead_officer_id="OFF-001",
            incident_date=now - timedelta(days=22),
            created_at=now - timedelta(days=21, hours=4),
            updated_at=now - timedelta(days=1)
        ),
        Case(
            case_id="CASE-2026-002",
            title="Operation Ghost Ledger: Autonomous Treasury Embezzlement & Wire Laundering",
            description="Forensic accounting and cyber intrusion case into unauthorized diversion of 14.8 million INR from Fintech Nexa corporate accounts through compromised API credentials and shell routing nodes.",
            case_type="Financial Cybercrime",
            status="Under Investigation",
            priority="High",
            lead_officer_id="OFF-002",
            incident_date=now - timedelta(days=18),
            created_at=now - timedelta(days=17, hours=2),
            updated_at=now - timedelta(days=2)
        ),
        Case(
            case_id="CASE-2026-003",
            title="Operation Dark Fiber: Critical Telecommunications Infrastructure Sabotage",
            description="Physical and network forensics into unauthorized optical fiber splicing and signal attenuation on the Bangalore Central Banking exchange loop, suggesting state-of-the-art wiretapping attempt.",
            case_type="Infrastructure Sabotage",
            status="Open",
            priority="High",
            lead_officer_id="OFF-004",
            incident_date=now - timedelta(days=10),
            created_at=now - timedelta(days=9, hours=8),
            updated_at=now - timedelta(days=3)
        ),
        Case(
            case_id="CASE-2026-004",
            title="Interception of Contraband Microelectronics Container at Whitefield ICD",
            description="Seizure and inspection of freight shipping container falsely manifested as industrial plastic molds, concealing dual-use cryptographic hardware testing benches bound for overseas transit.",
            case_type="Customs & Export Violation",
            status="Under Investigation",
            priority="Medium",
            lead_officer_id="OFF-003",
            incident_date=now - timedelta(days=14),
            created_at=now - timedelta(days=13),
            updated_at=now - timedelta(days=4)
        ),
        Case(
            case_id="CASE-2026-005",
            title="Counterfeit Bank Draft Presentation at Union Horizon MG Road",
            description="Inquiry into sophisticated high-fidelity cashier drafts presented by an unidentified courier attempting to draw on frozen corporate treasury reserves.",
            case_type="Bank Fraud",
            status="Open",
            priority="Medium",
            lead_officer_id="OFF-002",
            incident_date=now - timedelta(days=7),
            created_at=now - timedelta(days=6),
            updated_at=now - timedelta(days=2)
        ),
        Case(
            case_id="CASE-2026-006",
            title="Koramangala Safehouse Raid & Digital Evidence Recovery",
            description="Execution of judicial search warrant at residential safehouse resulting in apprehension of suspect Karan Varma, recovery of encrypted phones, cloned RFID badges, and unregistered vehicle keys.",
            case_type="Raid & Apprehension",
            status="Under Investigation",
            priority="Critical",
            lead_officer_id="OFF-001",
            incident_date=now - timedelta(days=5),
            created_at=now - timedelta(days=5, hours=3),
            updated_at=now - timedelta(hours=12)
        ),
        Case(
            case_id="CASE-2026-007",
            title="Nocturnal High-Speed Corridor Surveillance & Traffic Camera Tampering",
            description="Investigation into unauthorized wireless override of Outer Ring Road traffic signal controllers during night hours facilitating escape routes for convoy movements.",
            case_type="Traffic Control Tampering",
            status="On Hold",
            priority="Low",
            lead_officer_id="OFF-003",
            incident_date=now - timedelta(days=30),
            created_at=now - timedelta(days=29),
            updated_at=now - timedelta(days=10)
        ),
        Case(
            case_id="CASE-2026-008",
            title="Peenya Industrial Scrap Yard Metal Stamping Review",
            description="Historical audit of chassis stamping dies and recycled automotive plates logged across Peenya commercial scrapyards to cross-reference salvaged title certificates.",
            case_type="Regulatory Audit",
            status="Closed",
            priority="Low",
            lead_officer_id="OFF-005",
            incident_date=now - timedelta(days=60),
            created_at=now - timedelta(days=58),
            updated_at=now - timedelta(days=15)
        )
    ]
    db.add_all(cases)
    db.commit()

    # 8. Seed 15 Evidence Items
    print("Seeding Evidence Items...")
    evidence_items = [
        Evidence(evidence_id="EVD-001", title="Autel MaxiIM Key Programmer Unit", evidence_type="Digital Hardware", description="Handheld tablet with custom OBD-II cable harness used for cloning key fobs.", collection_date=now - timedelta(days=5), case_id="CASE-2026-001", collected_by_officer_id="OFF-001", storage_reference="Vault A / Bin 102", status="Logged in Secure Storage", notes="Seized during Koramangala safehouse search."),
        Evidence(evidence_id="EVD-002", title="Cloned BMW Smart Key Fob", evidence_type="Physical / Electronic", description="Unbranded aftermarket key fob programmed with rolling cryptographic seed matching VEH-001.", collection_date=now - timedelta(days=5), case_id="CASE-2026-001", collected_by_officer_id="OFF-001", storage_reference="Vault A / Shelf 12", status="Logged in Secure Storage", notes="Found in suspect Varma's jacket pocket."),
        Evidence(evidence_id="EVD-003", title="Recovered BMW 530d M-Sport (VEH-001)", evidence_type="Physical Vehicle", description="Stolen luxury sedan with partially ground-down chassis stamping and temporary false plate.", collection_date=now - timedelta(days=4), case_id="CASE-2026-001", collected_by_officer_id="OFF-003", storage_reference="Secure Police Impound Yard 2", status="Under Technical Examination", notes="Recovered inside Apex Auto Bodyworks workshop bay 3."),
        Evidence(evidence_id="EVD-004", title="Industrial Chassis Number Stamping Die Set", evidence_type="Physical Tool", description="Hardened steel alphanumeric punch set matching font used on counterfeit Karnataka registration plates.", collection_date=now - timedelta(days=4), case_id="CASE-2026-001", collected_by_officer_id="OFF-003", storage_reference="Vault B / Lockbox 44", status="Logged in Secure Storage", notes="Discovered concealed under hydraulic press workbench."),
        Evidence(evidence_id="EVD-005", title="Forensic Bit-Stream Image of ThinkPad X1 Laptop", evidence_type="Digital Forensics", description="E01 forensic image of 1TB NVMe drive belonging to cloud admin Naveen Hegde.", collection_date=now - timedelta(days=16), case_id="CASE-2026-002", collected_by_officer_id="OFF-004", storage_reference="Digital Evidence SAN - Image #8812", status="Under Technical Examination", notes="MD5 hash verified: 4a2b91c0e3f789aa32b456123984abcd."),
        Evidence(evidence_id="EVD-006", title="Ledger Nano X Hardware Crypto Wallet", evidence_type="Digital Hardware", description="Hardware wallet recovered from Fintech Nexa server room floor behind rack 14.", collection_date=now - timedelta(days=16), case_id="CASE-2026-002", collected_by_officer_id="OFF-002", storage_reference="Vault A / RF-Shielded Bag 88", status="Logged in Secure Storage", notes="Pending PIN bypass / memory extraction."),
        Evidence(evidence_id="EVD-007", title="YubiKey 5C NFC Privileged Token", evidence_type="Digital Hardware", description="Hardware MFA token registered to executive treasury sign-off group.", collection_date=now - timedelta(days=15), case_id="CASE-2026-002", collected_by_officer_id="OFF-002", storage_reference="Vault A / Safe 01", status="Logged in Secure Storage", notes="Logged as primary second-factor vector for unauthorized wire batch #4401."),
        Evidence(evidence_id="EVD-008", title="Fiber Optic Bi-Directional Tap Module", evidence_type="Telecommunications Hardware", description="Passive 90/10 optical beam splitter installed on live banking fiber strand inside Manhole MH-44.", collection_date=now - timedelta(days=9), case_id="CASE-2026-003", collected_by_officer_id="OFF-004", storage_reference="Vault C / Fragile Optical Case 03", status="Submitted to Lab for Analysis", notes="Clean cut with professional diamond cleaver evident."),
        Evidence(evidence_id="EVD-009", title="EXFO OTDR Optical Reflectometer Unit", evidence_type="Digital Hardware", description="Optical distance measuring unit recovered from abandoned contractor utility van.", collection_date=now - timedelta(days=9), case_id="CASE-2026-003", collected_by_officer_id="OFF-003", storage_reference="Vault C / Shelf 09", status="Logged in Secure Storage", notes="Saved measurements point directly to MH-44 junction coordinates."),
        Evidence(evidence_id="EVD-010", title="Custom CAN-Bus Sniffer Diagnostic Board", evidence_type="Digital Hardware", description="Custom STM32 board with dual high-speed CAN transceivers and microSD logger.", collection_date=now - timedelta(days=5), case_id="CASE-2026-001", collected_by_officer_id="OFF-001", storage_reference="Vault A / Bin 104", status="Logged in Secure Storage", notes="Found attached to OBD-II port of suspect vehicle VEH-005."),
        Evidence(evidence_id="EVD-011", title="Seized Apple iPhone 14 Pro Max", evidence_type="Digital Device", description="Target handset seized from suspect Karan Varma upon detention.", collection_date=now - timedelta(days=5), case_id="CASE-2026-006", collected_by_officer_id="OFF-001", storage_reference="Vault A / Faraday Shield 21", status="Under Technical Examination", notes="Forensic extraction in progress via Cellebrite Premium."),
        Evidence(evidence_id="EVD-012", title="Hikvision Surveillance NVR Hard Drive", evidence_type="Digital Media", description="Seagate SkyHawk 4TB surveillance hard disk from Grand Azure loading dock NVR.", collection_date=now - timedelta(days=20), case_id="CASE-2026-001", collected_by_officer_id="OFF-004", storage_reference="Digital Vault SAN - Disk #092", status="Logged in Secure Storage", notes="Contains footage of suspect wearing valet uniform entering vehicle."),
        Evidence(evidence_id="EVD-013", title="Counterfeit Bank Cashier Vouchers (Batch of 4)", evidence_type="Documentary", description="High-resolution printed bank vouchers on watermarked security bond paper.", collection_date=now - timedelta(days=6), case_id="CASE-2026-005", collected_by_officer_id="OFF-002", storage_reference="Document Vault Folder #2026-05", status="Logged in Secure Storage", notes="Microprinting flaws identified under forensic ultraviolet comparison."),
        Evidence(evidence_id="EVD-014", title="Shipping Manifest & Customs Declarations (BHLU-982104)", evidence_type="Documentary", description="Triplicate bills of lading and container cargo declaration manifests.", collection_date=now - timedelta(days=13), case_id="CASE-2026-004", collected_by_officer_id="OFF-003", storage_reference="Document Vault Folder #2026-04", status="Logged in Secure Storage", notes="Consignee company listed as fictitious overseas trading LLC."),
        Evidence(evidence_id="EVD-015", title="Scrap Metal Logbook Ledger (Apex Auto 2024-2025)", evidence_type="Documentary", description="Physical handwritten register containing vehicle chassis dismantling receipts.", collection_date=now - timedelta(days=55), case_id="CASE-2026-008", collected_by_officer_id="OFF-005", storage_reference="Archive Storage Box #12", status="Archived", notes="Historical baseline reference for VIN stamping pattern matches."),
        Evidence(evidence_id="EVD-016", title="SanDisk Extreme 256GB Hardware-Encrypted USB Drive", evidence_type="Digital Device", description="Encrypted flash drive containing BitLocker recovery keys and shell company bank routing credentials.", collection_date=now - timedelta(days=14), case_id="CASE-2026-002", collected_by_officer_id="OFF-002", storage_reference="Vault A / Bin 110", status="Under Technical Examination", notes="SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"),
        Evidence(evidence_id="EVD-017", title="Counterfeit Consular Notarization Seal", evidence_type="Physical Tool", description="Brass relief stamp used to certify fraudulent transit manifests for stolen cargo containers.", collection_date=now - timedelta(days=7), case_id="CASE-2026-005", collected_by_officer_id="OFF-003", storage_reference="Vault B / Shelf 04", status="Logged in Secure Storage", notes="Seized during raiding of clandestine printing shop in Yeshwanthpur."),
        Evidence(evidence_id="EVD-018", title="Samsung Galaxy S23 Ultra Burner Handset", evidence_type="Digital Device", description="Target device with ProtonMail and Signal sessions mapped to SIM ICCID #899144023910.", collection_date=now - timedelta(days=3), case_id="CASE-2026-001", collected_by_officer_id="OFF-001", storage_reference="Vault A / RF-Shield Bag 92", status="Under Technical Examination", notes="Forensic physical extraction completed; chat database recovered."),
        Evidence(evidence_id="EVD-019", title="Thermal Drone Surveillance Flight Log (DR-09)", evidence_type="Digital Media", description="Telemetry log file recording thermal signatures and night movement at Peenya warehouse perimeter.", collection_date=now - timedelta(days=22), case_id="CASE-2026-007", collected_by_officer_id="OFF-004", storage_reference="Digital Vault SAN - Log #4401", status="Logged in Secure Storage", notes="Confirmed unauthorized vehicle departures at 03:15 AM."),
        Evidence(evidence_id="EVD-020", title="Multi-Band Tactical Cellular Jammer Unit", evidence_type="Electronic Weaponry", description="High-power 8-antenna RF jammer configured to block 4G/5G, GPS L1/L2, and Wi-Fi tracking signals.", collection_date=now - timedelta(days=8), case_id="CASE-2026-003", collected_by_officer_id="OFF-003", storage_reference="Vault C / Explosive & RF Locker", status="Submitted to Lab for Analysis", notes="Recovered from utility vehicle roof compartment."),
        Evidence(evidence_id="EVD-021", title="Port Klang Cargo Bill of Lading (MSCU-440192)", evidence_type="Documentary", description="Original ocean freight manifest for refrigerated container carrying disassembled luxury vehicle engines.", collection_date=now - timedelta(days=12), case_id="CASE-2026-004", collected_by_officer_id="OFF-002", storage_reference="Document Vault Folder #2026-04B", status="Logged in Secure Storage", notes="Cross-referenced with Interpol maritime alert #M-2026-099."),
        Evidence(evidence_id="EVD-022", title="Counterfeit State Transport Transit Permits (Batch of 12)", evidence_type="Documentary", description="Security holograms and road transport toll clearance badges matching fraudulent freight convoy.", collection_date=now - timedelta(days=18), case_id="CASE-2026-008", collected_by_officer_id="OFF-005", storage_reference="Archive Storage Box #15", status="Archived", notes="UV examination confirmed forged state transport commissioner signature.")
    ]
    db.add_all(evidence_items)
    db.commit()

    # 9. Seed Evidence Custody Events
    print("Seeding Chain of Custody History Events...")
    custody_events = [
        EvidenceCustody(evidence_id="EVD-001", officer_id="OFF-001", event_type="Collected", event_timestamp=now - timedelta(days=5, hours=2), notes="Recovered at Koramangala safehouse under search warrant #SW-2026-44."),
        EvidenceCustody(evidence_id="EVD-001", officer_id="OFF-005", event_type="Transferred", event_timestamp=now - timedelta(days=5, hours=1), notes="Transferred to CID Evidence Vault; seal verified intact."),
        EvidenceCustody(evidence_id="EVD-001", officer_id="OFF-004", event_type="Checked Out for Analysis", event_timestamp=now - timedelta(days=3), notes="Checked out by forensic examiner Sunita Rao for firmware chip extraction."),
        EvidenceCustody(evidence_id="EVD-001", officer_id="OFF-005", event_type="Returned to Secure Storage", event_timestamp=now - timedelta(days=2), notes="Returned to Vault A Bin 102 following flash dump completion."),

        EvidenceCustody(evidence_id="EVD-003", officer_id="OFF-003", event_type="Collected", event_timestamp=now - timedelta(days=4, hours=4), notes="Vehicle impounded at Peenya workshop during tactical entry."),
        EvidenceCustody(evidence_id="EVD-003", officer_id="OFF-004", event_type="Checked Out for Analysis", event_timestamp=now - timedelta(days=3, hours=8), notes="Chassis numbers treated with acid etching reagent for latent VIN recovery."),

        EvidenceCustody(evidence_id="EVD-005", officer_id="OFF-004", event_type="Collected", event_timestamp=now - timedelta(days=16), notes="Physical laptop seized at Fintech Nexa offices; write-blocker attached on-site."),
        EvidenceCustody(evidence_id="EVD-005", officer_id="OFF-004", event_type="Submitted to Lab for Analysis", event_timestamp=now - timedelta(days=15), notes="Bit-stream image created with Tableau forensic duplicator."),

        EvidenceCustody(evidence_id="EVD-008", officer_id="OFF-004", event_type="Collected", event_timestamp=now - timedelta(days=9, hours=3), notes="Extracted from underground telecom conduit junction MH-44."),
        EvidenceCustody(evidence_id="EVD-008", officer_id="OFF-005", event_type="Transferred", event_timestamp=now - timedelta(days=9, hours=1), notes="Deposited into climate-controlled forensic lockbox."),

        EvidenceCustody(evidence_id="EVD-011", officer_id="OFF-001", event_type="Collected", event_timestamp=now - timedelta(days=5, hours=3), notes="Handset removed from person of Karan Varma at time of arrest."),
        EvidenceCustody(evidence_id="EVD-011", officer_id="OFF-004", event_type="Transferred", event_timestamp=now - timedelta(days=4), notes="Transferred to digital forensics lab for passcode bypass."),

        EvidenceCustody(evidence_id="EVD-016", officer_id="OFF-002", event_type="Collected", event_timestamp=now - timedelta(days=14, hours=2), notes="Seized from server rack lockbox at Fintech Nexa headquarters."),
        EvidenceCustody(evidence_id="EVD-016", officer_id="OFF-004", event_type="Checked Out for Analysis", event_timestamp=now - timedelta(days=13), notes="Transferred to lab for hardware-level NAND flash chip dump."),

        EvidenceCustody(evidence_id="EVD-018", officer_id="OFF-001", event_type="Collected", event_timestamp=now - timedelta(days=3, hours=5), notes="Recovered from suspect waistband during detention."),
        EvidenceCustody(evidence_id="EVD-018", officer_id="OFF-005", event_type="Transferred", event_timestamp=now - timedelta(days=3, hours=1), notes="Placed inside RF-shielded Faraday locker in Vault A."),

        EvidenceCustody(evidence_id="EVD-020", officer_id="OFF-003", event_type="Collected", event_timestamp=now - timedelta(days=8, hours=4), notes="Dismantled from roof rack of intercepted contractor van."),
        EvidenceCustody(evidence_id="EVD-020", officer_id="OFF-004", event_type="Checked Out for Analysis", event_timestamp=now - timedelta(days=7), notes="Submitted for RF spectrum analysis and jamming frequency sweep.")
    ]
    db.add_all(custody_events)
    db.commit()

    # 10. Seed Case Activities
    print("Seeding Case Activities...")
    activities = [
        CaseActivity(case_id="CASE-2026-001", officer_id="OFF-001", activity_type="Case Initialization", title="Investigation Opened", description="Grand Azure luxury car theft escalated to Major Crimes Division.", activity_timestamp=now - timedelta(days=21, hours=4)),
        CaseActivity(case_id="CASE-2026-001", officer_id="OFF-001", activity_type="Surveillance Review", title="CCTV Review at Hotel", description="Review of 16-channel video reveals coordinated key swap using decoy valet uniform.", activity_timestamp=now - timedelta(days=19)),
        CaseActivity(case_id="CASE-2026-001", officer_id="OFF-003", activity_type="ANPR Alert", title="Automated Toll Match", description="Stolen BMW 530d flagged passing Nelamangala toll plaza on forged plates.", activity_timestamp=now - timedelta(days=11)),
        CaseActivity(case_id="CASE-2026-001", officer_id="OFF-001", activity_type="Search & Seizure", title="Tactical Raid at Peenya Workshop", description="Apex Auto Bodyworks raided; VEH-001 recovered inside paint booth with grinding tools.", activity_timestamp=now - timedelta(days=4)),
        CaseActivity(case_id="CASE-2026-001", officer_id="OFF-001", activity_type="Interrogation", title="Suspect Interrogation Conducted", description="Suspect Karan Varma questioned regarding transport logistics to Mangaluru port.", activity_timestamp=now - timedelta(days=1)),

        CaseActivity(case_id="CASE-2026-002", officer_id="OFF-002", activity_type="Case Initialization", title="Treasury Breach Logged", description="Whistleblower report from CFO Meera Nambiar logged under Cybercrimes docket.", activity_timestamp=now - timedelta(days=17, hours=2)),
        CaseActivity(case_id="CASE-2026-002", officer_id="OFF-002", activity_type="Network Forensics", title="Cloud Access Audit", description="Correlated 43 unauthorized AWS Secrets Manager API calls originated from rogue IP range.", activity_timestamp=now - timedelta(days=15)),
        CaseActivity(case_id="CASE-2026-002", officer_id="OFF-004", activity_type="Hardware Forensics", title="Workstation Disk Imaging", description="Forensic clone completed of ThinkPad X1 workstation assigned to sysadmin Naveen Hegde.", activity_timestamp=now - timedelta(days=14)),

        CaseActivity(case_id="CASE-2026-003", officer_id="OFF-004", activity_type="Physical Inspection", title="Subterranean Conduit Survey", description="Civil engineering inspection inside Manhole MH-44 identifies optical fiber splitter attached to core trunk.", activity_timestamp=now - timedelta(days=9, hours=6)),
        CaseActivity(case_id="CASE-2026-006", officer_id="OFF-001", activity_type="Search & Seizure", title="Warrant Execution at Koramangala", description="Joint CID tactical team breached Flat 4B Silver Heights; suspect Varma detained without incident.", activity_timestamp=now - timedelta(days=5, hours=3))
    ]
    db.add_all(activities)
    db.commit()

    # 11. Populate Junction Tables (Many-to-Many Relationships)
    print("Wiring Junction Tables...")
    # case_people
    db.execute(case_people.insert().values([
        {"case_id": "CASE-2026-001", "person_id": "PER-001", "role_in_case": "Primary Ring Leader / Broker", "notes": "Identified by hotel surveillance and confidential informant."},
        {"case_id": "CASE-2026-001", "person_id": "PER-003", "role_in_case": "Technical Accomplice (CAN-Bus Modder)", "notes": "Programmed aftermarket key fobs."},
        {"case_id": "CASE-2026-001", "person_id": "PER-004", "role_in_case": "Key Eye Witness", "notes": "Valet supervisor who witnessed vehicle drive away."},
        {"case_id": "CASE-2026-001", "person_id": "PER-005", "role_in_case": "Bodyworks Operator (Receiver)", "notes": "Ran VIN alteration workshop in Peenya."},
        {"case_id": "CASE-2026-002", "person_id": "PER-002", "role_in_case": "Complainant / Reporting Officer", "notes": "Fintech CFO who detected fund discrepancies."},
        {"case_id": "CASE-2026-002", "person_id": "PER-006", "role_in_case": "Primary Insider Subject", "notes": "Sysadmin with root access to AWS production accounts."},
        {"case_id": "CASE-2026-002", "person_id": "PER-009", "role_in_case": "Security Compliance Witness", "notes": "Flagged anomalous login sessions."},
        {"case_id": "CASE-2026-003", "person_id": "PER-008", "role_in_case": "Telecom Splicer Witness", "notes": "Noticed unapproved manhole cover displacement."},
        {"case_id": "CASE-2026-004", "person_id": "PER-012", "role_in_case": "Transport Driver", "notes": "Operator of container truck carrying intercepted hardware."},
        {"case_id": "CASE-2026-004", "person_id": "PER-015", "role_in_case": "Logistics Dispatch Director", "notes": "Signed fraudulent customs freight bills."},
        {"case_id": "CASE-2026-005", "person_id": "PER-011", "role_in_case": "Bank Manager (Witness)", "notes": "Refused encashment of suspicious vouchers."},
        {"case_id": "CASE-2026-006", "person_id": "PER-001", "role_in_case": "Arrested Subject", "notes": "Apprehended in residence during raid."}
    ]))

    # case_organizations
    db.execute(case_organizations.insert().values([
        {"case_id": "CASE-2026-001", "organization_id": "ORG-001", "association_type": "Primary Workshop / Chop Shop"},
        {"case_id": "CASE-2026-001", "organization_id": "ORG-005", "association_type": "Incident Scene (Hotel Theft)"},
        {"case_id": "CASE-2026-002", "organization_id": "ORG-002", "association_type": "Victim Enterprise"},
        {"case_id": "CASE-2026-003", "organization_id": "ORG-004", "association_type": "Targeted Critical Infrastructure"},
        {"case_id": "CASE-2026-004", "organization_id": "ORG-003", "association_type": "Carrier / Freight Forwarder"},
        {"case_id": "CASE-2026-004", "organization_id": "ORG-006", "association_type": "Source of Hardware Units"}
    ]))

    # case_vehicles
    db.execute(case_vehicles.insert().values([
        {"case_id": "CASE-2026-001", "vehicle_id": "VEH-001", "role_in_case": "Stolen Target Vehicle"},
        {"case_id": "CASE-2026-001", "vehicle_id": "VEH-002", "role_in_case": "Escort / Shadow Vehicle"},
        {"case_id": "CASE-2026-001", "vehicle_id": "VEH-003", "role_in_case": "Dismantled Parts Transporter"},
        {"case_id": "CASE-2026-001", "vehicle_id": "VEH-005", "role_in_case": "Technician Getaway Car"},
        {"case_id": "CASE-2026-001", "vehicle_id": "VEH-007", "role_in_case": "Witness Vehicle with Dashcam"},
        {"case_id": "CASE-2026-004", "vehicle_id": "VEH-006", "role_in_case": "Container Transport Carrier"}
    ]))

    # case_devices
    db.execute(case_devices.insert().values([
        {"case_id": "CASE-2026-001", "device_id": "DEV-001", "role_in_case": "Transponder Cloning Tablet"},
        {"case_id": "CASE-2026-001", "device_id": "DEV-006", "role_in_case": "Hotel Security Video Recorder"},
        {"case_id": "CASE-2026-001", "device_id": "DEV-007", "role_in_case": "CAN-Bus Sniffer Interface"},
        {"case_id": "CASE-2026-002", "device_id": "DEV-002", "role_in_case": "Intrusion Terminal Laptop"},
        {"case_id": "CASE-2026-002", "device_id": "DEV-003", "role_in_case": "Compromised YubiKey Token"},
        {"case_id": "CASE-2026-002", "device_id": "DEV-008", "role_in_case": "Cold Storage Crypto Escrow"},
        {"case_id": "CASE-2026-003", "device_id": "DEV-004", "role_in_case": "Fiber Cable Fault Locator"},
        {"case_id": "CASE-2026-006", "device_id": "DEV-005", "role_in_case": "Seized Encrypted iPhone"}
    ]))

    # case_locations
    db.execute(case_locations.insert().values([
        {"case_id": "CASE-2026-001", "location_id": "LOC-001", "association_type": "Primary Crime Scene (Theft)"},
        {"case_id": "CASE-2026-001", "location_id": "LOC-002", "association_type": "Recovery Location (Chop Shop)"},
        {"case_id": "CASE-2026-001", "location_id": "LOC-005", "association_type": "ANPR Camera Hit Location"},
        {"case_id": "CASE-2026-002", "location_id": "LOC-003", "association_type": "Corporate Server Floor (Origin)"},
        {"case_id": "CASE-2026-003", "location_id": "LOC-004", "association_type": "Underground Manhole Splice Site"},
        {"case_id": "CASE-2026-004", "location_id": "LOC-006", "association_type": "Container Seizure Depot"},
        {"case_id": "CASE-2026-005", "location_id": "LOC-008", "association_type": "Fraudulent Presentation Branch"},
        {"case_id": "CASE-2026-006", "location_id": "LOC-007", "association_type": "Judicial Warrant Raid Address"}
    ]))

    # person_organizations
    db.execute(person_organizations.insert().values([
        {"person_id": "PER-002", "organization_id": "ORG-002", "role": "Chief Financial Officer"},
        {"person_id": "PER-005", "organization_id": "ORG-001", "role": "Proprietor & Master Mechanic"},
        {"person_id": "PER-006", "organization_id": "ORG-002", "role": "Senior Cloud Infrastructure Lead"},
        {"person_id": "PER-009", "organization_id": "ORG-002", "role": "Information Security Officer"},
        {"person_id": "PER-015", "organization_id": "ORG-003", "role": "Managing Director / Partner"}
    ]))

    # person_vehicles
    db.execute(person_vehicles.insert().values([
        {"person_id": "PER-001", "vehicle_id": "VEH-002", "relationship_type": "Frequent Driver / Passenger"},
        {"person_id": "PER-003", "vehicle_id": "VEH-005", "relationship_type": "Registered Owner"},
        {"person_id": "PER-005", "vehicle_id": "VEH-003", "relationship_type": "Commercial Fleet Owner"},
        {"person_id": "PER-007", "vehicle_id": "VEH-007", "relationship_type": "Registered Private Owner"}
    ]))

    # person_devices
    db.execute(person_devices.insert().values([
        {"person_id": "PER-001", "device_id": "DEV-005", "relationship_type": "Primary Cellular Phone"},
        {"person_id": "PER-003", "device_id": "DEV-001", "relationship_type": "Operator / User"},
        {"person_id": "PER-003", "device_id": "DEV-007", "relationship_type": "Hardware Developer"},
        {"person_id": "PER-006", "device_id": "DEV-002", "relationship_type": "Assigned Corporate Workstation"},
        {"person_id": "PER-006", "device_id": "DEV-003", "relationship_type": "Assigned Security Token"}
    ]))

    # evidence links
    db.execute(evidence_people.insert().values([
        {"evidence_id": "EVD-001", "person_id": "PER-001", "association_type": "Seized from bedroom table"},
        {"evidence_id": "EVD-002", "person_id": "PER-001", "association_type": "Recovered from personal effects"},
        {"evidence_id": "EVD-003", "person_id": "PER-005", "association_type": "Found inside commercial premises"},
        {"evidence_id": "EVD-005", "person_id": "PER-006", "association_type": "Issued employee laptop"}
    ]))

    db.execute(evidence_vehicles.insert().values([
        {"evidence_id": "EVD-001", "vehicle_id": "VEH-005", "association_type": "Programmed codes match vehicle memory"},
        {"evidence_id": "EVD-002", "vehicle_id": "VEH-001", "association_type": "Cryptographic key unlocks vehicle"},
        {"evidence_id": "EVD-010", "vehicle_id": "VEH-005", "association_type": "Wired directly into vehicle harness"}
    ]))

    db.execute(evidence_devices.insert().values([
        {"evidence_id": "EVD-001", "device_id": "DEV-001", "association_type": "Physical unit identical to DEV-001"},
        {"evidence_id": "EVD-005", "device_id": "DEV-002", "association_type": "Bitstream image of hard disk"},
        {"evidence_id": "EVD-008", "device_id": "DEV-004", "association_type": "Measured by reflectometer"}
    ]))

    db.execute(evidence_locations.insert().values([
        {"evidence_id": "EVD-001", "location_id": "LOC-007", "association_type": "Seized during apartment search"},
        {"evidence_id": "EVD-003", "location_id": "LOC-002", "association_type": "Recovered in Peenya paint bay"},
        {"evidence_id": "EVD-008", "location_id": "LOC-004", "association_type": "Extracted from manhole interior"},
        {"evidence_id": "EVD-012", "location_id": "LOC-001", "association_type": "Recovered from hotel control room"}
    ]))

    db.commit()
    print("SQL Relational Database successfully populated.")

def seed_mongo_database(doc_col):
    now = utc_now()
    doc_col.delete_many({}) # Clear existing documents for clean seed
    mongo_docs = [
        # Witness Statements
        {
            "document_type": "Witness statements",
            "title": "Formal Sworn Statement of Valet Supervisor Pooja Kulkarni",
            "content": "On Friday evening at approximately 21:15, a man dressed in a navy blazer identical to hotel valet staff approached the key podium while our team was busy handling a wedding banquet arrival. He requested the key fob for the navy BMW 530d parked in bay B-2, claiming the guest was departing early. He did not show a standard valet token, but had a printed vehicle dispatch slip. He entered the vehicle and drove toward Residency Road exit without turning headlights on immediately.",
            "summary": "Valet supervisor details suspect in counterfeit uniform obtaining BMW 530d key fob during banquet rush.",
            "source_type": "Field Interview",
            "source_name": "Recorded Audio Transcript - CID Squad A",
            "created_at": now - timedelta(days=21),
            "ingested_at": now - timedelta(days=20, hours=22),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-004"}, {"entity_type": "vehicle", "entity_id": "VEH-001"}, {"entity_type": "location", "entity_id": "LOC-001"}],
            "tags": ["valet theft", "blue sedan", "hotel security", "bmw 530d", "sworn statement"],
            "metadata": {"witness_credibility": "High", "interviewing_officer": "OFF-001", "audio_recording_ref": "REC-2026-0491.flac", "sworn_oath": True},
            "document_status": "Verified"
        },
        {
            "document_type": "Witness statements",
            "title": "Deposition of Telecom Splicer Farhan Khan Regarding Manhole MH-44",
            "content": "I was dispatched for routine scheduled cable grooming near Golf Course Road on Tuesday morning. When opening Manhole MH-44, I immediately noticed the safety seals were cut and two fiber tubes (Buffer Tubes 3 and 4) had their outer Kevlar jackets slit open. A yellow jumper patch cord was connected into an unapproved 1x2 splitter box zip-tied to the cable tray. This configuration is not authorized in OpticCore engineering topologies.",
            "summary": "Technician describes unauthorized optical splitter tapped into core banking trunk in MH-44.",
            "source_type": "Formal Filing",
            "source_name": "OpticCore Infrastructure Incident Ticket #OC-9921",
            "created_at": now - timedelta(days=10),
            "ingested_at": now - timedelta(days=9, hours=20),
            "case_id": "CASE-2026-003",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-008"}, {"entity_type": "location", "entity_id": "LOC-004"}, {"entity_type": "evidence", "entity_id": "EVD-008"}],
            "tags": ["fiber optic", "wiretap", "telecom sabotage", "optical splitter", "manhole"],
            "metadata": {"technical_severity": "Critical", "fiber_loss_db": 3.8, "affected_circuits": ["SWIFT-RTGS-PRI-01", "BSE-DIRECT-FEED"]},
            "document_status": "Verified"
        },
        {
            "document_type": "Witness statements",
            "title": "Bank Branch Manager Testimony on Forged Cashier Drafts",
            "content": "On Monday afternoon at 14:10, an unknown male presented two cashier checks purporting to be drawn on the corporate payroll account of Fintech Nexa Capital Solutions. The paper felt noticeably thinner than genuine RBI security stock, and upon running the MICR line through our scanner, the checksum failed. When I requested second-factor identification, the individual abandoned the vouchers and left through the MG Road lobby.",
            "summary": "Bank manager details presentation of fraudulent paper drafts and suspect departure upon challenge.",
            "source_type": "Field Interview",
            "source_name": "MG Road Station General Diary Entry #412",
            "created_at": now - timedelta(days=6),
            "ingested_at": now - timedelta(days=6, hours=1),
            "case_id": "CASE-2026-005",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-011"}, {"entity_type": "evidence", "entity_id": "EVD-013"}, {"entity_type": "location", "entity_id": "LOC-008"}],
            "tags": ["counterfeit", "bank fraud", "cashier check", "fintech nexa"],
            "metadata": {"voucher_amount_inr": 2850000, "micr_fault_code": "CHK_SUM_FAIL_09"},
            "document_status": "Verified"
        },

        # Investigation Notes
        {
            "document_type": "Investigation notes",
            "title": "Lead Investigator Field Notes: Peenya Industrial Workshop Raid",
            "content": "Entry executed at 06:15 with 8 officers from Major Crimes. Workshop bay was locked from outside with heavy padlock. Inside, identified stolen BMW 530d (Navy Blue, original plate KA-01-MJ-8821 removed, displaying counterfeit plate KA-04-XX-0000). Chassis stamping area on driver's side firewall was covered in metal shavings and hydrochloric acid solution. Discovered hardened steel alphanumeric punch dies in lockbox under press.",
            "summary": "Detailed field observations during tactical entry and vehicle recovery in Peenya chop shop.",
            "source_type": "Internal CID Log",
            "source_name": "Officer Rajesh Sharma Diary Book 3",
            "created_at": now - timedelta(days=4),
            "ingested_at": now - timedelta(days=4, hours=2),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "location", "entity_id": "LOC-002"}, {"entity_type": "vehicle", "entity_id": "VEH-001"}, {"entity_type": "evidence", "entity_id": "EVD-003"}],
            "tags": ["raid notes", "vin cloning", "blue sedan", "peenya", "bmw"],
            "metadata": {"team_size": 8, "tactical_breach_time_sec": 45, "weapons_drawn": False},
            "document_status": "Verified"
        },
        {
            "document_type": "Investigation notes",
            "title": "Cyber Forensic Notes: AWS Cloud Audit & Compromised Secrets",
            "content": "Extracted AWS CloudTrail logs indicate account 'admin-nhegde' invoked GetSecretValue for secret ARN 'arn:aws:secretsmanager:ap-south-1:treasury-signer-key' at 02:44 UTC. Request IP originated from residential broadband subnet registered to Yeshwanthpur. The API session token did not exhibit normal browser user-agent signatures, confirming automated script execution via python-boto3.",
            "summary": "Technical analysis of unauthorized cloud credential harvesting and Python automated invocation.",
            "source_type": "Digital Forensic Extraction",
            "source_name": "Cybercrime Lab Case File CC-2026-90",
            "created_at": now - timedelta(days=15),
            "ingested_at": now - timedelta(days=15, hours=4),
            "case_id": "CASE-2026-002",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-006"}, {"entity_type": "organization", "entity_id": "ORG-002"}],
            "tags": ["aws cloudtrail", "api intrusion", "cyber forensics", "insider threat"],
            "metadata": {"ip_origin": "103.212.44.81", "boto3_version": "1.34.12", "arn_accessed": "treasury-signer-key"},
            "document_status": "Verified"
        },
        {
            "document_type": "Investigation notes",
            "title": "Tactical Debrief: Koramangala Safehouse Search Warrant Execution",
            "content": "Warrant #SW-2026-44 executed at Flat 4B, Silver Heights. Suspect Karan Varma was awake in living room. Seized three encrypted smartphones, Autel IM608 diagnostic tablet, blank RFID transponder cards, 12 blank European smart key fobs, and 340,000 INR in physical currency notes. Suspect claimed he was merely a software contractor.",
            "summary": "Inventory and situational debrief following warrant execution at primary suspect safehouse.",
            "source_type": "Internal CID Log",
            "source_name": "CID Tactical Operations Summary Report",
            "created_at": now - timedelta(days=5),
            "ingested_at": now - timedelta(days=5, hours=1),
            "case_id": "CASE-2026-006",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-001"}, {"entity_type": "location", "entity_id": "LOC-007"}, {"entity_type": "device", "entity_id": "DEV-001"}],
            "tags": ["safehouse raid", "autel tablet", "key programmer", "search warrant"],
            "metadata": {"currency_seized_inr": 340000, "blank_fobs_count": 12, "miranda_read": True},
            "document_status": "Verified"
        },

        # Social Media Posts
        {
            "document_type": "Social media posts",
            "title": "OSINT Telegram Channel Export: 'Bangalore Fast Auto Classifieds'",
            "content": "Posted in private channel @BlrAutoDirect: 'Fresh arrival. 2023 BMW 5-Series M-Sport, Imperial Blue, 8000 km, no hypothecation. Clean papers with NOC ready for transfer outside state. Cash only, inspection at Peenya after 10 PM. DM @ShadowRider88 for price. Serious buyers only.'",
            "summary": "Telegram listing advertising recently stolen blue sedan at steep discount for quick cash sale.",
            "source_type": "Public OSINT",
            "source_name": "Telegram Scrape Archive #TG-4019",
            "created_at": now - timedelta(days=12),
            "ingested_at": now - timedelta(days=11, hours=14),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "vehicle", "entity_id": "VEH-001"}, {"entity_type": "person", "entity_id": "PER-001"}],
            "tags": ["telegram osint", "blue sedan", "black market", "bmw 530d", "underground sale"],
            "metadata": {"telegram_channel": "@BlrAutoDirect", "message_id": 4812, "member_count": 1420},
            "document_status": "Verified"
        },
        {
            "document_type": "Social media posts",
            "title": "Forum Post on Darknet Vehicle Electronics Forum 'OBD-Masters'",
            "content": "User 'DevByte_Blr' posted: 'Need decrypted firmware dump for 2022+ BMW BDC3 immobilizer module. Have working CAN-bus trace from live car. Willing to exchange for patched Autel 908 software loader. Contact via Session ID: 05c9a102...'",
            "summary": "Underground automotive forum query seeking immobilizer cryptographic bypass matching seized CAN traces.",
            "source_type": "Public OSINT",
            "source_name": "Tor Onion Crawl - Darknet Archive 2026",
            "created_at": now - timedelta(days=25),
            "ingested_at": now - timedelta(days=22),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-003"}, {"entity_type": "device", "entity_id": "DEV-007"}],
            "tags": ["darknet forum", "can-bus", "immobilizer", "devendra joshi"],
            "metadata": {"onion_domain": "obdmaster77xj29.onion", "threat_actor_alias": "DevByte_Blr"},
            "document_status": "Verified"
        },

        # Chat Exports
        {
            "document_type": "Chat exports",
            "title": "Decrypted Signal Messenger Export: Varma & Joshi Coordination",
            "content": "[2026-10-02 18:30:11] Varma: Is the transponder emulator flashed for the 5-series?\n[2026-10-02 18:32:45] Joshi: Yes, loaded the rolling-code seed from the hotel garage sniffer. Keep the antenna within 1 meter of the door handle.\n[2026-10-02 18:33:10] Varma: Good. As soon as the valet parks it, I will walk up in uniform. Sameer has the Peenya bay cleared and false plates ready.\n[2026-10-02 18:35:00] Joshi: Make sure you kill the factory GPS antenna under the rear sharkfin immediately.",
            "summary": "Explicit coordination chat detailing key cloning, disguise, and Peenya garage routing.",
            "source_type": "Digital Forensic Extraction",
            "source_name": "Seized iPhone 14 Pro Max (EVD-011) Forensic Extraction",
            "created_at": now - timedelta(days=20),
            "ingested_at": now - timedelta(days=4, hours=18),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-001"}, {"entity_type": "person", "entity_id": "PER-003"}, {"entity_type": "person", "entity_id": "PER-005"}],
            "tags": ["signal chat", "wiretap evidence", "conspiracy", "blue sedan", "peenya"],
            "metadata": {"encryption_protocol": "Signal Double Ratchet", "extraction_tool": "Cellebrite Premium 2026"},
            "document_status": "Verified"
        },
        {
            "document_type": "Chat exports",
            "title": "Slack Internal Channel Dump: Fintech Nexa IT Security Emergency",
            "content": "[03:12] Sneha Sen: Alert: High priority treasury webhook returned 401 Unauthorized for Batch #4401.\n[03:14] Naveen Hegde: Looking into it. Probably an automated AWS secret rotation hiccup. Do not page leadership yet.\n[03:22] Sneha Sen: Wait, outbound wire of 14.8M INR just authorized with YubiKey #3. Naveen, did you initiate this?\n[03:25] Naveen Hegde: Checking logs right now... System is slow.\n[03:30] Dr. Meera Nambiar (CFO): What is happening on the core ledger? Freeze all outbound gateways immediately!",
            "summary": "Internal incident chat showing unauthorized wire transfer and attempts to delay alerting.",
            "source_type": "Digital Forensic Extraction",
            "source_name": "Corporate Slack Workspace Archive - Nexa Capital",
            "created_at": now - timedelta(days=18),
            "ingested_at": now - timedelta(days=17, hours=6),
            "case_id": "CASE-2026-002",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-002"}, {"entity_type": "person", "entity_id": "PER-006"}, {"entity_type": "person", "entity_id": "PER-009"}],
            "tags": ["slack export", "incident response", "embezzlement", "fintech nexa"],
            "metadata": {"channel_name": "#sec-incident-treasury", "messages_exported": 58},
            "document_status": "Verified"
        },

        # Image Metadata
        {
            "document_type": "Image metadata",
            "title": "EXIF & Camera Telemetry: Valet Podium Surveillance Still",
            "content": "Image Frame #88210 extracted from Grand Azure Hotel CCTV Camera CAM-04 (H.265 / 4K). Depicts individual in faux valet uniform holding blue sedan key fob. Lighting conditions: ambient fluorescent 4000K. Distance to target: 4.8 meters. Aspect ratio: 16:9. Color grading matches navy vehicle exterior reflection.",
            "summary": "Technical image analysis of CCTV still frame capturing suspect at hotel valet stand.",
            "source_type": "Sensor Log",
            "source_name": "Hikvision NVR Telemetry Extractor",
            "created_at": now - timedelta(days=21, hours=2),
            "ingested_at": now - timedelta(days=20, hours=10),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "location", "entity_id": "LOC-001"}, {"entity_type": "device", "entity_id": "DEV-006"}],
            "tags": ["exif metadata", "cctv still", "blue sedan", "grand azure"],
            "metadata": {"resolution": "3840x2160", "shutter_speed": "1/100s", "focal_length": "4.2mm", "lux_level": 48.2},
            "document_status": "Verified"
        },
        {
            "document_type": "Image metadata",
            "title": "High-Resolution Forensic Macro Photography: Tampered Stamping Firewall",
            "content": "Macro photographic series (Nikon D850 with 105mm f/2.8 Micro Nikkor) documenting VIN stamping striations on recovered BMW 530d. Original stamping 'WBA530D...' shows circular abrasive tool markings beneath secondary electro-engraved counterfeit digits 'KA04...'. Tool mark depth variation indicates non-factory manual strike.",
            "summary": "Forensic laboratory macro photo report demonstrating physical VIN alteration marks.",
            "source_type": "Internal CID Log",
            "source_name": "Forensic Science Laboratory (FSL) Photo Log",
            "created_at": now - timedelta(days=3),
            "ingested_at": now - timedelta(days=2, hours=18),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "vehicle", "entity_id": "VEH-001"}, {"entity_type": "evidence", "entity_id": "EVD-003"}],
            "tags": ["macro photography", "vin tampering", "tool marks", "fsl"],
            "metadata": {"magnification": "5x", "lighting": "Oblique LED Ra 98", "iso": 100},
            "document_status": "Verified"
        },

        # CCTV Metadata
        {
            "document_type": "CCTV metadata",
            "title": "Automated Number Plate Recognition (ANPR) Checkpoint Telemetry",
            "content": "Nelamangala Highway ANPR Camera Cluster 3 logged trigger at 23:44:12 UTC. Vehicle class: Luxury Sedan. Color signature: Dark Blue / Navy. Recognized plate: KA-04-XX-0000 (Confidence 98.4%). Cross-reference against Vahan National Vehicle Registry returned 'Plate Allocated to Agricultural Tractor Trailer', immediately tripping stolen vehicle alarm.",
            "summary": "ANPR automated detection of forged plate mounted on luxury blue sedan fleeing city.",
            "source_type": "Surveillance",
            "source_name": "NH-48 Intelligent Traffic Management System (ITMS)",
            "created_at": now - timedelta(days=11),
            "ingested_at": now - timedelta(days=11, hours=1),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "location", "entity_id": "LOC-005"}, {"entity_type": "vehicle", "entity_id": "VEH-001"}],
            "tags": ["anpr log", "highway cctv", "blue sedan", "forged plate", "traffic hit"],
            "metadata": {"speed_kmph": 118, "lane": "Outbound Express 2", "anpr_ocr_confidence": 0.984},
            "document_status": "Verified"
        },
        {
            "document_type": "CCTV metadata",
            "title": "Basement Ramp Surveillance Metadata: Grand Azure Hotel",
            "content": "Metadata extract from Milestone XProtect VMS: Camera CAM-07 (Underground Parking Ramp Outbound). Motion event duration: 18 seconds. Vehicle detected exiting without headlights. Secondary vehicle (Silver Toyota Innova KA-04-EQ-4019) followed 22 seconds later in trail position.",
            "summary": "Security camera metadata verifying target sedan followed by silver convoy support vehicle.",
            "source_type": "Surveillance",
            "source_name": "Milestone VMS Video Server #2",
            "created_at": now - timedelta(days=21, hours=3),
            "ingested_at": now - timedelta(days=20, hours=8),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "vehicle", "entity_id": "VEH-001"}, {"entity_type": "vehicle", "entity_id": "VEH-002"}, {"entity_type": "location", "entity_id": "LOC-001"}],
            "tags": ["cctv log", "parking garage", "convoy trail", "blue sedan"],
            "metadata": {"vms_event_id": "EVT-88192-RAMP", "motion_trigger": True, "framerate_fps": 30},
            "document_status": "Verified"
        },

        # PDF Reports
        {
            "document_type": "PDF reports",
            "title": "Comprehensive Digital Forensic Examination Report: ThinkPad X1",
            "content": "Forensic Examiner Sunita Rao, CID Cyber Lab. Evidence Item EVD-005: 1TB Samsung PM981 NVMe drive. File system analysis revealed unallocated clusters containing Python scripts titled 'vault_drainer.py'. The script reads API keys from memory dumps of the Chromium browser process. Timestamps match the execution window of the unauthorized corporate wire diversion.",
            "summary": "Official lab report detailing discovery of custom automated exfiltration scripts on suspect workstation.",
            "source_type": "Formal Filing",
            "source_name": "Forensic Science Laboratory Report #FSL-CYBER-2026-112",
            "created_at": now - timedelta(days=12),
            "ingested_at": now - timedelta(days=11, hours=20),
            "case_id": "CASE-2026-002",
            "related_entity_ids": [{"entity_type": "evidence", "entity_id": "EVD-005"}, {"entity_type": "officer", "entity_id": "OFF-004"}],
            "tags": ["forensic report", "cyber crime", "python script", "fsl", "pdf document"],
            "metadata": {"pdf_pages": 24, "examiner": "Sunita Rao", "court_admissible": True, "checksum": "SHA256:d8a2..."},
            "document_status": "Verified"
        },
        {
            "document_type": "PDF reports",
            "title": "Vehicle Chassis Metallurgical Inspection Certificate",
            "content": "State Automotive Testing Lab report on recovered vehicle chassis. Micro-hardness tests and chemical etching around the vehicle identification number confirmed that original factory stamped characters were mechanically abraded using a pneumatic carbide burr. Residual stress patterns reveal remnants of original VIN ending in '...8821'.",
            "summary": "Engineering metallurgy report confirming mechanical VIN erasure and original registration match.",
            "source_type": "Formal Filing",
            "source_name": "Automotive Research & Forensic Certification Agency (ARFCA)",
            "created_at": now - timedelta(days=2),
            "ingested_at": now - timedelta(days=1, hours=10),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "vehicle", "entity_id": "VEH-001"}, {"entity_type": "evidence", "entity_id": "EVD-003"}],
            "tags": ["metallurgy", "vin verification", "blue sedan", "forensic report"],
            "metadata": {"lab_certificate_no": "MET-2026-091", "hardness_hrc": 42.5},
            "document_status": "Verified"
        },

        # Email Archives
        {
            "document_type": "Email archives",
            "title": "Inter-Departmental Security Alert: Suspected Insider Wire Diversion",
            "content": "From: meera.nambiar@nexacapital.demo\nTo: rajesh.sharma@fusion.gov.in, ananya.roy@fusion.gov.in\nSubject: Urgent: Unauthorized Treasury Outflow - Account #908812\nDate: 2026-10-05 06:30 IST\n\nDear Officers Sharma and Roy,\nFollowing our preliminary internal audit this morning, our core banking ledger reflects a batch of four automated RTGS payments totaling 14,800,000 INR dispatched between 02:45 and 03:15 AM. These payments were authenticated with our executive hardware tokens while our offices were closed. We request immediate freeze orders on the beneficiary clearing routes.",
            "summary": "Initial notification email from corporate CFO requesting emergency law enforcement freeze on stolen funds.",
            "source_type": "Email Archive",
            "source_name": "Official Corporate Mail Exporter - Nexa",
            "created_at": now - timedelta(days=17),
            "ingested_at": now - timedelta(days=17, hours=1),
            "case_id": "CASE-2026-002",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-002"}, {"entity_type": "organization", "entity_id": "ORG-002"}],
            "tags": ["email alert", "cfo report", "fintech nexa", "wire fraud"],
            "metadata": {"email_headers_verified": True, "dkim_status": "Pass", "priority": "Urgent"},
            "document_status": "Verified"
        },
        {
            "document_type": "Email archives",
            "title": "Customs Cargo Discrepancy Notice: Freight Container BHLU-982104",
            "content": "From: customs.superintendent@whitefieldicd.gov.in\nTo: vikram.malhotra@fusion.gov.in\nSubject: Detention of 40ft Export Container - M/s Blue Horizon Logistics\n\nContainer BHLU-982104 declared as 'Industrial Nylon Gaskets' was scanned via portal mobile gamma-ray scanner. High-density component silhouettes do not correspond to polymer gaskets. Non-intrusive imaging shows high-grade circuit boards, oscilloscopes, and unpopulated BGA chips. Physical seal placed under Section 110.",
            "summary": "Customs superintendent email alerting field team to intercepted container of contraband microelectronics.",
            "source_type": "Email Archive",
            "source_name": "Whitefield Customs Gateway Mail Spool",
            "created_at": now - timedelta(days=13),
            "ingested_at": now - timedelta(days=13, hours=3),
            "case_id": "CASE-2026-004",
            "related_entity_ids": [{"entity_type": "organization", "entity_id": "ORG-003"}, {"entity_type": "location", "entity_id": "LOC-006"}],
            "tags": ["customs alert", "container detention", "whitefield icd", "microelectronics"],
            "metadata": {"container_id": "BHLU-982104", "seal_intact": True, "scanner_type": "Gamma Portal"},
            "document_status": "Verified"
        },

        # JSON API Responses
        {
            "document_type": "JSON API responses",
            "title": "National Vahan Vehicle Registry API Query: KA-01-MJ-8821",
            "content": '{"query_status": "SUCCESS", "registration_no": "KA-01-MJ-8821", "vehicle_class": "MOTOR CAR (LMV)", "maker": "BMW INDIA PVT LTD", "model": "530D M SPORT AUTO", "fuel_type": "DIESEL", "color": "IMPERIAL BLUE METALLIC", "chassis_no_masked": "WBA530D20MXXXXXX", "engine_no_masked": "B57D30XXXXXX", "registered_owner": "Singhania Classic Holdings", "status": "FLAGGED_STOLEN", "stolen_alert_date": "2026-10-01T22:30:00Z", "rto": "KA-01 KORAMANGALA"}',
            "summary": "Official national vehicle portal API payload confirming stolen vehicle status and original registration parameters.",
            "source_type": "Sensor Log",
            "source_name": "Vahan National Vehicle Database Gateway",
            "created_at": now - timedelta(days=21, hours=1),
            "ingested_at": now - timedelta(days=20, hours=23),
            "case_id": "CASE-2026-001",
            "related_entity_ids": [{"entity_type": "vehicle", "entity_id": "VEH-001"}],
            "tags": ["vahan api", "rto record", "blue sedan", "stolen vehicle", "json response"],
            "metadata": {"api_endpoint": "https://vahan.nic.in/api/v2/rc/verify", "response_time_ms": 230, "http_status": 200},
            "document_status": "Verified"
        },
        {
            "document_type": "JSON API responses",
            "title": "Blockchain Explorer Webhook: Tether (USDT) Flight Path",
            "content": '{"network": "TRON (TRC-20)", "transaction_hash": "7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b", "block_number": 68491024, "from_address": "TQ8xMv... (Compromised Exchange Hot Wallet)", "to_address": "TY9zPq... (Unregistered Offshore Mixer)", "amount_usdt": 178500.0, "timestamp_utc": "2026-10-05T03:45:12Z", "fee_trx": 14.2, "confirmations": 1420}',
            "summary": "Automated cryptographic blockchain webhook showing laundering of embezzled fiat converted to USDT.",
            "source_type": "Sensor Log",
            "source_name": "TronScan Blockchain Monitoring Node",
            "created_at": now - timedelta(days=17),
            "ingested_at": now - timedelta(days=16, hours=20),
            "case_id": "CASE-2026-002",
            "related_entity_ids": [{"entity_type": "device", "entity_id": "DEV-008"}],
            "tags": ["blockchain", "usdt", "crypto tracing", "wire diversion", "json webhook"],
            "metadata": {"blockchain": "TRON", "asset": "USDT", "mixer_detected": True},
            "document_status": "Verified"
        },

        # Additional diverse documents to complete the dataset
        {
            "document_type": "Investigation notes",
            "title": "Surveillance Log: Outer Ring Road Bellandur Flyover Stakeout",
            "content": "Squad B maintained stationary surveillance near Bellandur flyover junction. Observed vehicle VEH-005 (Grey Verna) slowing down near cellular tower node at 01:30 AM. Passenger Devendra Joshi seen operating handheld directional antenna pointed at traffic control cabinet. Signal sequence switched to green on southbound lane simultaneously.",
            "summary": "Observation log of traffic light RF tampering during late night convoy passage.",
            "source_type": "Internal CID Log",
            "source_name": "Night Reconnaissance Log #B-19",
            "created_at": now - timedelta(days=8),
            "ingested_at": now - timedelta(days=7, hours=22),
            "case_id": "CASE-2026-007",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-003"}, {"entity_type": "location", "entity_id": "LOC-009"}],
            "tags": ["traffic tampering", "stakeout", "outer ring road"],
            "metadata": {"weather": "Clear", "surveillance_mode": "Mobile Unmarked"},
            "document_status": "Verified"
        },
        {
            "document_type": "Witness statements",
            "title": "Statement of Scrapyard Custodian Harish Chandra on Peenya Deliveries",
            "content": "I operate parts yard 14 in Peenya. Sameer Qureshi from Apex Auto has been coming to my yard for three years. Last month he asked if I had any damaged 2021-2023 BMW or Audi chassis plates cut from written-off insurance claims. I told him insurance total-loss vehicles must have their VINs de-registered with RTO and I could not sell bare plates without scrap paperwork. He offered triple cash price, but I declined.",
            "summary": "Scrap dealer testifies to suspect attempting to purchase legitimate salvaged title plates for cloning.",
            "source_type": "Field Interview",
            "source_name": "Peenya Station Formal Deposition",
            "created_at": now - timedelta(days=15),
            "ingested_at": now - timedelta(days=14, hours=12),
            "case_id": "CASE-2026-008",
            "related_entity_ids": [{"entity_type": "person", "entity_id": "PER-010"}, {"entity_type": "person", "entity_id": "PER-005"}],
            "tags": ["salvage fraud", "vin plates", "scrapyard", "peenya"],
            "metadata": {"recorded_by": "OFF-005", "legal_counsel_present": False},
            "document_status": "Verified"
        },
        {
            "document_type": "PDF reports",
            "title": "Telecom Network Operational Audit: Vasanth Nagar Exchange Tapping Incident",
            "content": "Engineering report prepared by OpticCore Network Operations Center. Physical inspection of Manhole MH-44 revealed a high-precision coupler causing 3.8 dB signal attenuation on core DWDM channel 44. Analysis of buffered packet headers indicates an attempt to mirror unencrypted inter-bank message streams prior to TLS encapsulation.",
            "summary": "Technical network audit detailing the impact of physical optical fiber tapping.",
            "source_type": "Formal Filing",
            "source_name": "OpticCore Security Operations Center",
            "created_at": now - timedelta(days=8),
            "ingested_at": now - timedelta(days=7, hours=18),
            "case_id": "CASE-2026-003",
            "related_entity_ids": [{"entity_type": "location", "entity_id": "LOC-004"}, {"entity_type": "organization", "entity_id": "ORG-004"}],
            "tags": ["telecom report", "fiber tapping", "dwdm", "opticcore"],
            "metadata": {"attenuation_db": 3.8, "dwdm_channel": 44, "incident_classification": "Tier 1 Critical"},
            "document_status": "Verified"
        },
        {
            "document_type": "Social media posts",
            "title": "Twitter / X Sentiment Capture on Nighttime Outer Ring Road Bypass Races",
            "content": "Tweet by user @BlrCitizen_Alert: 'Huge group of modified sports sedans speeding on ORR Bellandur flyover again at 2 AM. Looked like a blue BMW and a grey turbo Verna blowing through red lights that magically turned green right as they approached! @BlrCityPolice please look into this.'",
            "summary": "Public social media report corroborating speed corridor and manipulated traffic lights.",
            "source_type": "Public OSINT",
            "source_name": "Twitter API Firehose Capture",
            "created_at": now - timedelta(days=28),
            "ingested_at": now - timedelta(days=27, hours=4),
            "case_id": "CASE-2026-007",
            "related_entity_ids": [{"entity_type": "location", "entity_id": "LOC-009"}],
            "tags": ["twitter osint", "citizen report", "orr traffic", "blue sedan"],
            "metadata": {"retweets": 48, "likes": 210, "geolocation_tagged": "Bellandur"},
            "document_status": "Verified"
        },
        {
            "document_type": "JSON API responses",
            "title": "Bank Wire Gateway Audit Log (JSON Extract)",
            "content": '{"gateway_id": "SWIFT_IND_01", "batch_reference": "BTCH-2026-4401", "transaction_count": 4, "total_value_inr": 14800000.0, "signoff_key_id": "YK5-8829104", "originating_ip": "103.212.44.81", "timestamp": "2026-10-05T03:12:44Z", "settlement_status": "SETTLED_PENDING_RECALL"}',
            "summary": "Raw JSON log from corporate banking gateway validating transaction batch metadata.",
            "source_type": "Sensor Log",
            "source_name": "Core Banking Gateway Audit Export",
            "created_at": now - timedelta(days=17, hours=2),
            "ingested_at": now - timedelta(days=16, hours=15),
            "case_id": "CASE-2026-002",
            "related_entity_ids": [{"entity_type": "device", "entity_id": "DEV-003"}],
            "tags": ["wire gateway", "swift audit", "fintech nexa", "json payload"],
            "metadata": {"batch_id": "BTCH-2026-4401", "settlement_rail": "RTGS"},
            "document_status": "Verified"
        },
        {
            "document_type": "Investigation notes",
            "title": "Case Closure Summary & Regulatory Filing: Peenya Scrap Yard Audit",
            "content": "Officer Arvind Patil. Completed comprehensive inspection of all licensed scrapyards in Peenya 2nd Stage. Total of 1,420 de-registered chassis records reconciled with state transport authority. Found 3 non-compliant unlogged commercial vehicle frames at premises of Harish Chandra; administrative penalty imposed under Karnataka Scrap Policy 2022. No criminal nexus established with active vehicle theft ring.",
            "summary": "Formal administrative closure report for Peenya scrapyards regulatory audit.",
            "source_type": "Internal CID Log",
            "source_name": "CID Audit Book 2026 - Closed Case Log",
            "created_at": now - timedelta(days=15),
            "ingested_at": now - timedelta(days=14, hours=20),
            "case_id": "CASE-2026-008",
            "related_entity_ids": [{"entity_type": "officer", "entity_id": "OFF-005"}, {"entity_type": "person", "entity_id": "PER-010"}],
            "tags": ["case closure", "audit summary", "regulatory report", "peenya"],
            "metadata": {"audit_score": "88/100", "penalties_levied_inr": 25000},
            "document_status": "Verified"
        }
    ]

    doc_col.insert_many(mongo_docs)
    total_docs = doc_col.count_documents({})
    print(f"Successfully seeded {total_docs} investigation documents into MongoDB collection 'investigation_documents'.")

def seed_database(force: bool = False):
    print("=" * 60)
    print("Starting Intelligence Fusion Platform Data Seeding...")
    print("=" * 60)

    # 1. SQL Database Seeding
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    sql_cases_count = db.query(Case).count()

    if sql_cases_count > 0 and not force:
        print(f"SQL database already contains {sql_cases_count} cases. Preserving existing data (use --force to overwrite).")
    else:
        seed_sql_database(db)

    # 2. MongoDB Document Store Seeding
    print("Connecting to MongoDB for Document Store Seeding...")
    mdb = get_mongo_db()
    if mdb is None:
        print("Warning: MongoDB not available; skipping MongoDB seeding.")
    else:
        doc_col = mdb["investigation_documents"]
        existing_docs = doc_col.count_documents({})
        if existing_docs > 0 and not force:
            print(f"MongoDB already contains {existing_docs} documents. Preserving existing data (use --force to overwrite).")
        else:
            seed_mongo_database(doc_col)

    print("=" * 60)
    print("Intelligence Fusion Platform Seed Complete!")
    print("Team: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)")
    print("=" * 60)

if __name__ == "__main__":
    force_arg = "--force" in sys.argv or "-f" in sys.argv
    seed_database(force=force_arg)
