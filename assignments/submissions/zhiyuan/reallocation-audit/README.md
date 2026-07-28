# Reallocation Engine, Audited — Application-Effort Triage

A tiny reallocation engine for INFO 7375. It reads company H-1B sponsorship history and
recommends moving a unit of an OPT student's scarce **application effort** from a weak
company to a strong one — with an explicit uncertainty and a hard stop before it commits.

Anchored to *The Reallocation Engine* — the "80 Days to Stay" layer (H-1B evidence).

## Run

```bash
python reallocate.py            # recommend only (safe — commits nothing, stops at the gate)
python reallocate.py --approve  # clears the hard stop and commits the move (simulated)
```

No dependencies — Python 3 standard library only.

## Data

`data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` (in this repo): 1,557 companies with
SEC/DOL H-1B fields. Real public data.

## Files

- `reallocate.py` — the tool
- `Yang_Zhiyuan_ReallocationEngine.md` — the validation report (the 7 skeptical checks)
- `frictional-journal.md` — before/after prediction
