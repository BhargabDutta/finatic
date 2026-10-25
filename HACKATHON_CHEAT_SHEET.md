# 🎙️ FINATIC HACKATHON POCKET CHEAT SHEET
### *The Plain-English Pocket Guide to Explain Your Tech to Anyone (and Win)*

Keep this handy on your phone or laptop during your pitch and Q&A.

---

## ⚡ 1. The 10-Second Explanations (Flashcards)

### 🧩 Q: "What is NLP Resolution? Is it AI?"
> **Your 10-second answer:**  
> *"No, it is NOT an expensive LLM or ChatGPT — and that’s intentional. The hackathon brief advised against slow, hallucinating models. Our NLP Resolution is a lightning-fast on-device regex tokenizer + hand-assembled merchant dictionary. It strips out bank garbage words (like `ACH*`, `BLR`, `A/c`), pulls out the amount and date, and matches the merchant string with 100% accuracy, zero latency, and complete privacy."*

---

### 🏷️ Q: "What is the Entity & Alias Engine?"
> **Your 10-second answer:**  
> *"The **Entity** is the real-world company (e.g., Netflix). The **Aliases** are the 4 different messy codes printed on bank statements (`BILLDESK*NFLX`, `NETFLIX_MUM_AUTOPAY`, `NFLX_IN`).  
> In an Excel sheet, those look like 4 separate companies. In our Neo4j graph, all aliases point to a single Netflix node. This lets us immediately catch **Double Subscriptions** — where someone is paying for the exact same service twice across two different credit cards!"*

---

### ⛓️ Q: "What is a Chained Time-Series?"
> **Your 10-second answer:**  
> *"Instead of dumping monthly transactions into isolated database rows, Neo4j links consecutive payments like links in a bicycle chain:  
> `Month 1 (₹499) ──[:NEXT_CHARGE]──► Month 2 (₹649)`.  
> By simply comparing the two ends of that arrow, we catch **Silent Price Increases** and **Free Trial Traps** (where ₹2 auth jumps to ₹899) in a single 3-line Cypher query with zero table joins!"*

---

### 🕸️ Q: "Why use Neo4j instead of normal SQL / PostgreSQL?"
> **Your 10-second answer:**  
> *"SQL is great for lists. But recurring commitments are not a list — they are a **network**.  
> In SQL, finding price creeps requires slow self-joins, and finding multi-account duplicate subscriptions across messy descriptors is a nightmare. In Neo4j, it's just following the arrows. Plus, cancellation paths are literally directed decision graphs!"*

---

## 🎯 2. Tricky Questions Judges Might Ask (and the Winning Answers)

### 🥊 Judge: *"Why didn't you just use an AI model like Claude or GPT to parse the strings?"*
* **Winning Answer:**  
  *"Two reasons: First, the hackathon prompt explicitly says hand-assembled reference sets beat any model on the cases that matter. Second, bank SMS parsing must happen on-device in milliseconds with 100% determinism. An LLM can hallucinate numbers, costs money per API call, and leaks private financial data to the cloud."*

---

### 🥊 Judge: *"What happens if a merchant changes their descriptor completely?"*
* **Winning Answer:**  
  *"Our graph uses fuzzy Levenshtein distance fallback and links the new descriptor to the existing Mandate ID / UMRN. Even if the merchant changes their billing name from 'Hotstar' to 'JioStar', the underlying UMRN mandate edge stays connected to the same account!"*

---

### 🥊 Judge: *"How do you handle merchant ghosting if they don't have a cancel button?"*
* **Winning Answer:**  
  *"We don't rely on the merchant's mercy. For UPI Autopay, we give the user their UMRN and show them how to revoke it at the NPCI switch level inside Google Pay/PhonePe. If the merchant still attempts to charge, Finatic generates a pre-formatted Section 25 PSSA legal dispute notice to file with their bank and the RBI Ombudsman."*

---

## ⏱️ 3. The 3-Minute Presentation Formula

1. **Minute 1 — The Problem (The Bleed):**  
   Show the mobile app hero card: **`⚠️ SILENT ANNUAL BLEED: ₹58,400 / YEAR`**. Explain that money leaves quietly every month because bank descriptors are encrypted machine gibberish and cancellation is deliberately hidden.
2. **Minute 2 — The Solution (Neo4j Graph):**  
   Show Neo4j Bloom on your laptop. Point to the glowing nodes:  
   - *"Here is Netflix: 3 messy bank codes merged into 1 brand."*  
   - *"Here is the Chained Time-Series catching the +₹150 silent price hike."*  
   - *"Here is a Free Trial trap that quietly converted from ₹2 to ₹899."*
3. **Minute 3 — The Killswitch:**  
   Tap a card in Finatic to reveal the cancellation runbook. Show the exact steps to revoke the mandate on GPay/PhonePe or Bank SIHub.
