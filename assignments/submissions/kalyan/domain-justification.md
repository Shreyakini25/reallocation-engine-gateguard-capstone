# Domain Justification — case-supply-chain-planning-analyst-opt-dfw

## Who uses this, and in what exact situation

An M.S. Information Systems student (industrial/production engineering background) on F-1 OPT, STEM-OPT extension eligible, actively applying to **supply chain analyst / planning analyst** roles. Dallas-Fort Worth is the preferred location, remote is acceptable. This is not a generic "international job-seeker" — it is someone with a fixed OPT clock, a specific occupational target (SOC 13-1081, Logisticians), and a real cost every time an application goes to a company that turns out not to sponsor, or a posting that turns out to be dead.

## The information asymmetry this mode addresses

Right now, this information lives in at least four separate places, and none of them talk to each other:
1. Whether a company has ever sponsored H-1B (buried in DOL/H-1B history, not shown on any job posting)
2. Whether the company is even financially active enough to be a safe bet (SEC Form D filing recency)
3. Whether a specific posting is actually still open, or a stale/ghost listing (invisible from the listing page itself)
4. Whether the reply that came back to an application (or the silence) represents a real status change

A candidate manually checking all four signals per role, across dozens of applications, inside a shrinking OPT window, is exactly the information-asymmetry problem the Reallocation Engine exists to solve. This mode compresses those four checks into one scored recommendation with a full audit trail, so the candidate spends limited application effort where it's actually justified.

## Engine layers it connects to

- **80 Days to Stay** — sponsorship history and SEC Form D funding recency, both used directly as scorer inputs.
- **Job-Ops** — ATS detection and posting liveness (`ats:scan`, `ats:liveness`) as the hard gate before any role is scored Apply-eligible.
- **The Cognitive Pivot** — BLS/O*NET SOC 13-1081 role-quality reference is in the Source Inventory, though its scoring weight is currently 0 (see mode file's Known Gaps) — an honest limitation, not a hidden one.

## Failure modes specific to this domain

**1. Company-level sponsorship history does not guarantee role-level or level-specific sponsorship.** A company can show up as a "proven" historical sponsor in aggregate H-1B/DOL data while not sponsoring *this specific role*, *this specific level* (e.g. entry-level analyst vs. senior), or even *this year*, if their sponsorship pattern has shifted with headcount or budget changes. The shape of this error: a role scores Apply on paper, the candidate spends real effort and OPT time applying, and the mismatch only surfaces deep into the interview process — or not until an offer falls through at the visa stage. **Who struggles most to catch it:** the candidate themselves, since verifying role-level (not just company-level) sponsorship intent typically requires a direct recruiter conversation the candidate may not get access to before investing time — exactly the asymmetry this mode cannot close on its own.

**2. A live posting is not the same as an actively-reviewed posting.** The liveness gate correctly catches dead/ghost postings (a page returning 404 or removed), but a posting can pass the liveness check and still be a "keep it open for pipeline" listing that no one is actively reviewing — common with high-volume ATS boards. The shape of this error: the mode gates a role as Apply-eligible on liveness alone, but liveness ≠ active hiring intent. **Who struggles most to catch it:** an applicant with limited industry insider access (no warm intro, no recruiter relationship) has no independent signal to distinguish an actively-reviewed listing from a passively-open one — this is precisely the kind of thing MODEX-style direct industry conversations can surface, but a scored pipeline cannot.
