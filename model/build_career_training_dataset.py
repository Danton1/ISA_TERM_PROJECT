import pandas as pd
import re
import random
import tqdm
from urllib.parse import urlparse, unquote

# ============================================================
# CONFIG
# ============================================================
INPUT_CSV = r"D:\gigsup\education_model\job_skills.csv"
OUTPUT_CSV = r"D:\gigsup\education_model\career_skill_training.csv"

TOP_N = 3
random.seed(42)

# ============================================================
# CONTAMINATION PATTERNS — maximum strictness
# ============================================================

HARD_DROP = [
    # Compensation / benefits / HR
    r"\$",
    r"salary",
    r"compensation",
    r"bonus",
    r"benefit",
    r"insurance",
    r"\bhealth\b",
    r"\bmedical\b",
    r"\b401k?\b",
    r"\bretirement\b",
    r"\bdental\b",
    r"\bvision\b",
    r"\bpto\b",
    r"\bpaid time off\b",
    r"\bvacation\b",

    # Job description / hiring language
    r"responsib",
    r"\bduties\b",
    r"\bperform\b",
    r"\bmanage\b",
    r"supervis",
    r"\blead\b",
    r"\bcoordinate\b",
    r"\bimplement\b",
    r"\bexecute\b",
    r"\bschedule\b",
    r"\breport\b",
    r"\bdocument\b",
    r"\bcandidate\b",
    r"\bapply\b",
    r"\basap\b",
    r"work authorization",
    r"job id",
    r"job type",
    r"full time",
    r"part time",

    # Experience contamination
    r"\bexperienced?\b",
    r"\bexpert\b",
    r"\b\d+\+?\s*(years?|yrs?)\b",

    # Degrees / education
    r"bachelor",
    r"master",
    r"phd",
    r"\bdegree\b",

    # Certifications/licenses/clearances
    r"license",
    r"certificat",
    r"\bcert\b",
    r"clearance",
    r"\bdrug\b",
    r"background check",
    r"\bfbi\b",
    r"\btb\b",

    # Obvious posting junk
    r"equal opportunity",
    r"\beeo\b",
    r"eligibility to work",
]


# 20% bad skill tokens disqualifies whole row
MAX_BAD_RATIO = 0.20

# ============================================================
# CLEAN SINGLE SKILL
# ============================================================

def clean_skill_item(item: str):
    s = item.strip()
    s = re.sub(r"\(.*?\)", "", s).strip()

    # Drop if any contamination pattern matches
    for pat in HARD_DROP:
        if re.search(pat, s, flags=re.IGNORECASE):
            return None

    # Drop long chunks (job duties) > 3 words
    if len(s.split()) > 3:
        return None

    # Drop weird single-token junk
    if len(s) < 2:
        return None

    # Drop tokens that mix letters & punctuation weirdly
    if not re.fullmatch(r"[A-Za-z0-9\-\/#\+ ]+", s):
        return None

    # Normalize capitalization
    return " ".join(w.capitalize() for w in s.split())

# ============================================================
# CLEAN FULL SKILL LIST
# ============================================================

RAW_SKIP_IF_MATCH = [
    # clearly whole job descriptions / HR boilerplate got dumped in
    r"job description",
    r"position overview",
    r"apply now",
    r"experience required",
    r"role overview",
    r"equal opportunity",
    r"\beeo\b",

    # rows that are obviously benefit spam instead of skills
    r"health insurance",
    r"dental insurance",
    r"vision insurance",
    r"life insurance",
    r"paid time off",
    r"\b401k\b",
    r"retirement plan",
]

def raw_skill_contaminated(raw):
    raw_lower = str(raw).lower()
    for pat in RAW_SKIP_IF_MATCH:
        if re.search(pat, raw_lower):
            return True
    return False

def clean_skills(raw):
    if not isinstance(raw, str):
        return None

    items = [i.strip() for i in re.split(r"[;,]", raw) if i.strip()]
    cleaned = []
    bad = 0

    for item in items:
        c = clean_skill_item(item)
        if c:
            cleaned.append(c)
        else:
            bad += 1

    # If too much contamination, drop row entirely
    if len(items) == 0:
        return None
    if bad / len(items) > MAX_BAD_RATIO:
        return None

    # Require at least 2 skills
    if len(cleaned) < 2:
        return None

    # Deduplicate
    cleaned = list(dict.fromkeys(cleaned))

    return ", ".join(cleaned)

# ============================================================
# EXTRACT TITLE FROM LINKEDIN URL
# ============================================================

def extract_title_from_url(url: str):
    """
    Extract a clean job title from a LinkedIn job URL.

    - Strips trailing company, location, and HR noise (on-site, sign-on, FT/PT, salary, etc.)
    - Drops rows where we can't get a reasonable title.
    """
    if not isinstance(url, str) or "linkedin.com" not in url.lower():
        return None

    try:
        path = unquote(urlparse(url).path)
    except Exception:
        return None

    # Expect something like /jobs/view/senior-software-engineer-remote-3751234567
    m = re.search(r"/jobs/view/([^/?]+)", path)
    if not m:
        return None

    slug = m.group(1)

    # Remove trailing numeric job ID if present
    slug = re.sub(r"-\d+$", "", slug)

    # Split slug into tokens
    parts = [p for p in slug.split("-") if p]

    if not parts:
        return None

    # Words that usually mark the start of company / location / junk
    HARD_STOP = {
        "at", "with", "for", "hiring", "jobs", "job", "careers", "career",
        "remote", "hybrid", "onsite", "on-site", "on", "level", "shift"
    }

    # Tokens that usually mean schedule / HR decorations, not core title
    HR_NOISE = {
        "ft", "pt", "full-time", "part-time", "full", "part",
        "evening", "evenings", "night", "nights",
        "day", "days", "weekend", "weekends",
        "temp", "temporary", "contract", "locum",
        "per", "hour", "hours"
    }

    clean_tokens = []
    for token in parts:
        low = token.lower()

        # Hard stop: company/location/garbage marker
        if low in HARD_STOP:
            break

        # HR decoration we don't want in the title
        if low in HR_NOISE:
            break

        # Stop when we see something that looks like money or an ID/code
        # e.g. 8000, 15k, t0620, 40-hr, etc.
        if re.search(r"\d", low):
            break

        # Otherwise, keep this token as part of the title
        clean_tokens.append(token)

    if not clean_tokens:
        return None

    # Join and normalize capitalization
    title = " ".join(clean_tokens)
    title = " ".join(
        w.upper() if w.isupper() else w.capitalize()
        for w in title.split()
    )

    # Final guard: if the title still contains strong HR / comp junk, drop it
    bad_substrings = [
        "$", "sign on", "sign-on", "per hour", "per year",
        "bonus", "salary"
    ]
    lower_title = title.lower()
    if any(b in lower_title for b in bad_substrings):
        return None

    # Require non-trivial length
    if len(title) < 3:
        return None

    return title

# ============================================================
# PROMPTS
# ============================================================

BASE_PROMPTS = [
    "Given these skills, what career best fits?",
    "Suggest a job based on the following skills:",
    "What occupation is appropriate for someone with these abilities?",
    "Recommend a suitable job for this skill set:",
    "What job matches these skills?",
    "Find the best career choice for these skills:",
    "Based on the following skills, what role is a good fit?",
    "Which job would someone with this skill set be suited for?",
]

TOPN_PROMPT = f"List the top {TOP_N} careers that match these skills."

def clean_title_locations(title: str) -> str:
    """
    Remove geographic/location contamination from job titles.
    Handles city/state/country suffixes from LinkedIn slugs.
    """

    if not isinstance(title, str):
        return title

    t = title.strip()

    # Common location patterns (countries, states, provinces, cities)
    LOCATION_PATTERNS = [
        r"\b[A-Z][a-z]+,?\s+(UK|USA|US|Canada|Australia|New Zealand)\b",
        r"\b[A-Z][a-z]+,\s?[A-Z]{2}\b",                   # City, ST
        r"\b[A-Z][a-z]+\s+(TX|CA|FL|NY|NC|SC|AZ|NV|WA|OR)\b",
        r"\bUnited States\b",
        r"\bUSA\b",
        r"\bUS\b",
        r"\bCA\b",
        r"\bUK\b",
        r"\bTX\b",
        r"\bAZ\b",
        r"\bCO\b",
        r"\bOntario\b",
        r"\bBritish Columbia\b",
        r"\bAlberta\b",
        r"\bVancouver\b",
        r"\bToronto\b",
        r"\bAustin\b",
        r"\bDallas\b",
        r"\bSan Francisco\b",
        r"\bLos Angeles\b",
        r"\bPhoenix\b",
    ]

    for pat in LOCATION_PATTERNS:
        t = re.sub(pat, "", t, flags=re.IGNORECASE).strip()

    # Remove leading/trailing punctuation
    t = re.sub(r"[-,;/]+$", "", t).strip()

    return t

def generate_related_jobs(title, n=3):
    """
    Produce ONLY clean, location-free variants for ranking-style prompts.
    No assistant/support/technician variants. No geographic contamination.
    """

    if not isinstance(title, str):
        return ["Unknown Role"]

    # 1. Strip all location contamination
    core = clean_title_locations(title).strip()

    # 2. Generate safe variants (no assistant/tech/etc.)
    variants = [
        core,
        f"{core} (General)",
        f"{core} (Related)",
        f"{core} (Alternate Title)",
        f"{core} (Similar Role)",
    ]

    clean = []
    for v in variants:
        v_low = v.lower()

        # Hard-ban expansions that cause contamination
        if any(k in v_low for k in [
            "assistant", "technician", "associate", "support",
            "worker", "junior", "senior", "lead", "specialist",
            "$", "sign on", "bonus",
            "ft", "pt", "full time", "part time",
            "temporary", "contract", "hiring",
            "on call", "relocation", "urgent",
        ]):
            continue

        clean.append(v)

    # 3. Fallback safety
    if not clean:
        clean = [core]

    random.shuffle(clean)
    return clean[:n]

# ============================================================
# BUILD DATASET
# ============================================================

df = pd.read_csv(INPUT_CSV)
augmented_rows = []

print("Building hardened dataset...")

for _, row in tqdm.tqdm(df.iterrows(), total=len(df)):
    skills_raw = row.get("job_skills", "")
    if raw_skill_contaminated(skills_raw):
        continue
    skills = clean_skills(skills_raw)
    title = extract_title_from_url(row.get("job_link", ""))

    if not skills or title is None:
        continue

    # Normal SFT prompts
    for prompt in BASE_PROMPTS:
        augmented_rows.append({
            "instruction": prompt,
            "input": skills,
            "output": title
        })

    # Ranking-style prompts
    ranking = "\n".join(f"{i+1}. {j}" for i, j in enumerate(generate_related_jobs(title)))
    augmented_rows.append({
        "instruction": TOPN_PROMPT,
        "input": skills,
        "output": ranking
    })

# Shuffle final dataset
random.shuffle(augmented_rows)
pd.DataFrame(augmented_rows).to_csv(OUTPUT_CSV, index=False)

print(f"\n✅ DONE — hardened dataset saved to: {OUTPUT_CSV}")
print(f"Total samples: {len(augmented_rows)}")
