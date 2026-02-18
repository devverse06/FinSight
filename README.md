# 💳 FinSight

A full-stack web application for personal finance management using bank SMS image uploads.


---

## 🏦 Account Management Module
Users can securely **add, view, and delete their account numbers**, creating a personalized environment for transaction tracking.

---

## 📩 SMS-Based Transaction Extraction
Users upload **bank SMS screenshots**; the app uses **Tesseract OCR** to extract raw text, followed by **Gemini API** to parse this into structured **JSON-formatted transaction data**.

---

## 🧠 Intelligent Transaction Parsing

- Filters and stores only those transactions **linked to the user's registered account numbers**, ensuring **clean separation between business and personal transactions**.
- Prevents **duplicate entries** by validating unique **reference numbers** of each transaction — even if the same SMS image is uploaded again, it won’t be re-stored.

---

## 💰 Manual Cash Payment Support
Users can also **log cash payments manually**; each entry is assigned a **UUID-based reference ID**, keeping it distinct and consistent in the transaction history.

---

## 🔄 Real-Time Transaction History
Users can view their complete **formatted payment history** with **live updates** as new transactions are added, creating a seamless and dynamic user experience.

---

## 🧩 Tech Stack

- **Frontend**: React.js (minimalist UI focused on usability and clarity)
- **Backend**: Node.js / FastAPI (for image handling, OCR invocation, and DB operations)
- **Database**: MongoDB  
  (stores transactions with fields like `account_no`, `amount`, `txn_type`, `ref_no`, `timestamp`, and `user_id`)
- **APIs Used**:
  - `Tesseract.js` for OCR
  - `Gemini API` for structured data extraction

---

## 🔐 Data Integrity & User Safety

- Transactions are **user-specific** and stored **only if** the SMS contains a **recognized account number**.
- Ensures **no data duplication**, as **reference numbers** act as natural transaction fingerprints.

---
