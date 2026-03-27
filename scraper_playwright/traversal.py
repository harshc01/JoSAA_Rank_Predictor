import logging
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

from scraper.parser import parse_table
from scraper.storage import save_to_csv

log = logging.getLogger(__name__)

URL = "https://josaa.admissions.nic.in/Applicant/seatallotmentresult/currentorcr.aspx"
OUTPUT_PATH = "data/output.csv"

LEAF_LEVEL = 5
SAVE_EVERY = 500
NETWORK_TIMEOUT = 30_000

def _get_options(page: Page, nth: int) -> list[int]:
    """
    Return valid option indices (skipping index 0 = '--Select--') for dropdown nth(nth).
    Returns empty list if the dropdown has no real options yet.
    """
    dropdown = page.locator("select").nth(nth)
    count = dropdown.locator("option").count()
    return list(range(1, count))         # skip 0 (placeholder)


def _select(page: Page, nth: int, index: int) -> None:
    page.locator("select").nth(nth).select_option(index=index)
    if nth < LEAF_LEVEL:
        next_dropdown = page.locator("select").nth(nth + 1)
        try:
            page.wait_for_function(
                "(el) => el.options.length > 1",
                arg=next_dropdown.element_handle(),
                timeout=30_000,
            )
        except PWTimeout:
            page.wait_for_timeout(3000) # fallback if networkidle times out by it swlf
    else:
        page.wait_for_timeout(3000)


def _extract(page: Page) -> list[dict]:
    """Parse the results table from the current page state."""
    soup = BeautifulSoup(page.content(), "lxml")
    return parse_table(soup)


def _traverse(page: Page, level: int, results: list[dict]) -> None:
    """
    Recursively traverse all dropdown levels.

    level 0 → Round
    level 1 → Institute Type
    level 2 → Institute
    level 3 → Branch
    level 4 → Seat Type
    level 5 → Gender  (leaf: extract table here)
    """
    options = _get_options(page, level)

    if not options:
        log.warning("Level %d: no options available — skipping branch.", level)
        return

    log.info("Level %d: %d option(s) to iterate.", level, len(options))

    for idx in options:
        try:
            _select(page, level, idx)
        except PWTimeout:
            log.warning("Level %d idx %d: timeout on selection — skipping.", level, idx)
            continue

        if level < LEAF_LEVEL:
            _traverse(page, level + 1, results)
        else:
            records = _extract(page)
            results.extend(records)
            log.info("Level %d idx %d: +%d rows (total %d).", level, idx, len(records), len(results))

            if len(results) >= SAVE_EVERY:
                saved = save_to_csv(results, OUTPUT_PATH)
                log.info("Flushed %d records to %s.", saved, OUTPUT_PATH)
                results.clear()


class PlaywrightTraversal:

    def run(self):
        results: list[dict] = []

        with sync_playwright() as pw:
            browser = pw.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = browser.new_page()

            log.info("Loading JoSAA page...")
            page.goto(URL, timeout=60_000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(3000)

            try:
                _traverse(page, level=0, results=results)
            except Exception as exc:
                log.error("Traversal interrupted: %s", exc)
            finally:
                if results:
                    saved = save_to_csv(results, OUTPUT_PATH)
                    log.info("Final flush: %d records saved.", saved)
                browser.close()

        log.info("Done.")
