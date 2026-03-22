import logging
from .session import SessionManager
from .parser import parse_dropdown, parse_table
from .config import DROPDOWNS

log = logging.getLogger(__name__)


class TraversalEngine:

    def __init__(self):
        self.session = SessionManager()

    def run(self):
        log.info("Loading initial page...")
        soup = self.session.load()
        return self._traverse(soup, level=0, selections={})

    def _traverse(self, soup, level: int, selections: dict):
        if level >= len(DROPDOWNS):
            records = parse_table(soup)
            log.info("Extracted %d rows.", len(records))
            return records

        select_name = DROPDOWNS[level]
        options = parse_dropdown(soup, select_name)

        if not options:
            log.warning("Level %d — no options in '%s', skipping.", level, select_name)
            return []

        log.info("Level %d — '%s' has %d options.", level, select_name, len(options))

        results = []

        for value, text in options:
            log.info("Level %d — selecting: %s", level, text)

            updated_selections = {**selections, select_name: value}

            updated_soup = self.session.postback(
                event_target=select_name,
                selections={select_name: value},
            )

            child_results = self._traverse(updated_soup, level + 1, updated_selections)
            results.extend(child_results)

        return results
