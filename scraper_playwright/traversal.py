from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

from scraper.parser import parse_table
from scraper.storage import save_to_csv


URL = "https://josaa.admissions.nic.in/Applicant/seatallotmentresult/currentorcr.aspx"


class PlaywrightTraversal:

    def run(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            page = browser.new_page()
            page.goto(URL, timeout=60000)

            results = []

            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(5000)

            round_dropdown = page.locator("select").first
            rounds = round_dropdown.locator("option")

            for i in range(min(5, rounds.count())):
                print(rounds.nth(i).inner_text())

            for i in range(1, rounds.count()):
                round_dropdown.select_option(index=i)

                page.wait_for_selector("#ctl00_ContentPlaceHolder1_ddlInstituteType")

                inst_types = page.locator("#ctl00_ContentPlaceHolder1_ddlInstituteType option")

                for j in range(1, inst_types.count()):
                    page.select_option("#ctl00_ContentPlaceHolder1_ddlInstituteType", index=j)

                    page.wait_for_selector("#ctl00_ContentPlaceHolder1_ddlInstitute")

                    institutes = page.locator("#ctl00_ContentPlaceHolder1_ddlInstitute option")

                    for k in range(1, institutes.count()):
                        page.select_option("#ctl00_ContentPlaceHolder1_ddlInstitute", index=k)

                        page.wait_for_selector("#ctl00_ContentPlaceHolder1_ddlBranch")

                        branches = page.locator("#ctl00_ContentPlaceHolder1_ddlBranch option")

                        for l in range(1, branches.count()):
                            page.select_option("#ctl00_ContentPlaceHolder1_ddlBranch", index=l)

                            page.wait_for_selector("#ctl00_ContentPlaceHolder1_ddlSeatType")

                            seats = page.locator("#ctl00_ContentPlaceHolder1_ddlSeatType option")

                            for m in range(1, seats.count()):
                                page.select_option("#ctl00_ContentPlaceHolder1_ddlSeatType", index=m)

                                page.wait_for_selector("#ctl00_ContentPlaceHolder1_ddlGender")

                                genders = page.locator("#ctl00_ContentPlaceHolder1_ddlGender option")

                                for n in range(1, genders.count()):
                                    page.select_option("#ctl00_ContentPlaceHolder1_ddlGender", index=n)

                                    page.wait_for_selector("#ctl00_ContentPlaceHolder1_GridView1")

                                    html = page.content()
                                    soup = BeautifulSoup(html, "lxml")

                                    records = parse_table(soup)
                                    results.extend(records)

                                    print(f"Collected {len(records)} rows")

            save_to_csv(results, "data/output.csv")
            browser.close()
