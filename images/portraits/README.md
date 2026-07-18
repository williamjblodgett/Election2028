# Candidate Portraits

Drop real photos in this folder and the game uses them automatically — roster
cards, debate podiums, transcript chips, the dossier, and the election-night
video wall all switch from emoji to the photo on the next load. No code
changes needed. Any person without a photo simply keeps their emoji.

## File format

- **Filename:** exactly `<candidate id>.jpg` (ids listed below)
- **Crop:** head-and-shoulders, roughly square or 4:5 portrait — faces should
  sit in the upper half (the UI crops circles from the top-center)
- **Size:** ~400×500 px, JPEG quality ~80 (≈40–80 KB each) keeps the PWA light

## Where to get legal images

Do **not** use news-agency photos (Getty, AP, Reuters — copyrighted). Use:

- **Official U.S. federal portraits** (White House, Congress, cabinet):
  public domain as works of the federal government.
  - Congress: https://bioguide.congress.gov (member page → photo)
  - White House / LoC: https://www.loc.gov/free-to-use/presidential-portraits/
- **Official state portraits** (governors): usually free via the governor's
  office; California and Florida state works are public domain.
- **Wikimedia Commons** (https://commons.wikimedia.org): search the person's
  name; check the license box on the file page. `PD` files need nothing;
  `CC BY` / `CC BY-SA` files require the credit line below.

## Roster (filename → person → suggested source)

### 2028 field
| File | Person | Source / license |
|---|---|---|
| `newsom.jpg` | Gavin Newsom | CA governor official photo (PD-CAGov) |
| `buttigieg.jpg` | Pete Buttigieg | DOT Secretary official portrait (federal PD) |
| `aoc.jpg` | Alexandria Ocasio-Cortez | Official House portrait, bioguide (federal PD) |
| `harris.jpg` | Kamala Harris | Official VP portrait (federal PD) |
| `shapiro.jpg` | Josh Shapiro | PA governor official photo (check license — often CC BY) |
| `stephensmith.jpg` | Stephen A. Smith | Wikimedia Commons (CC BY — credit required) |
| `vance.jpg` | J.D. Vance | Official VP / Senate portrait (federal PD) |
| `rubio.jpg` | Marco Rubio | Official Senate / State Dept portrait (federal PD) |
| `desantis.jpg` | Ron DeSantis | FL governor official photo (Florida PD) |
| `trumpjr.jpg` | Donald Trump Jr. | Wikimedia Commons, e.g. Gage Skidmore (CC BY-SA — credit required) |
| `ramaswamy.jpg` | Vivek Ramaswamy | Wikimedia Commons, e.g. Gage Skidmore (CC BY-SA — credit required) |
| `carlson.jpg` | Tucker Carlson | Wikimedia Commons, e.g. Gage Skidmore (CC BY-SA — credit required) |

### Legends
All public domain — Library of Congress or official White House photos.
| File | Person | Suggested image |
|---|---|---|
| `legend_lincoln.jpg` | Abraham Lincoln | Alexander Gardner photo, 1863 (LoC) |
| `legend_teddy.jpg` | Theodore Roosevelt | Pach Bros. photo, 1904 (LoC) |
| `legend_fdr.jpg` | Franklin D. Roosevelt | 1944 official photo (LoC) |
| `legend_truman.jpg` | Harry S. Truman | Official White House photo (PD) |
| `legend_ike.jpg` | Dwight D. Eisenhower | Official White House photo (PD) |
| `legend_jfk.jpg` | John F. Kennedy | Official White House photo (PD) |
| `legend_lbj.jpg` | Lyndon B. Johnson | Official portrait, Arnold Newman (PD) |
| `legend_nixon.jpg` | Richard Nixon | Official 1971 portrait (PD) |
| `legend_reagan.jpg` | Ronald Reagan | Official 1981 portrait (PD) |
| `legend_obama.jpg` | Barack Obama | Official 2012 portrait, Pete Souza (PD) |
| `legend_washington_d.jpg` | George Washington | Gilbert Stuart painting scan (PD) |
| `legend_washington_r.jpg` | George Washington | Same file, copied to both names |

### Running mates
| File | Person | Source |
|---|---|---|
| `wes_moore.jpg` | Wes Moore | MD governor's office |
| `mark_kelly.jpg` | Mark Kelly | Official Senate portrait (federal PD) |
| `gretchen_whitmer.jpg` | Gretchen Whitmer | MI governor's office |
| `raphael_warnock.jpg` | Raphael Warnock | Official Senate portrait (federal PD) |
| `andy_beshear.jpg` | Andy Beshear | KY governor's office |
| `amy_klobuchar.jpg` | Amy Klobuchar | Official Senate portrait (federal PD) |
| `roy_cooper.jpg` | Roy Cooper | NC governor's office |
| `tammy_duckworth.jpg` | Tammy Duckworth | Official Senate portrait (federal PD) |
| `glenn_youngkin.jpg` | Glenn Youngkin | VA governor's office |
| `tim_scott.jpg` | Tim Scott | Official Senate portrait (federal PD) |
| `elise_stefanik.jpg` | Elise Stefanik | Official House portrait (federal PD) |
| `brian_kemp.jpg` | Brian Kemp | GA governor's office |
| `katie_britt.jpg` | Katie Britt | Official Senate portrait (federal PD) |
| `nikki_haley.jpg` | Nikki Haley | Official State Dept / UN portrait (federal PD) |
| `sarah_huckabee.jpg` | Sarah Huckabee Sanders | AR governor's office |
| `doug_burgum.jpg` | Doug Burgum | Interior Secretary official portrait (federal PD) |

## Credits for CC-licensed photos

If you use a `CC BY` / `CC BY-SA` file, add a line to `CREDITS.md` in this
folder (create it) with the person, photographer, and license, e.g.:

```
Tucker Carlson — photo by Gage Skidmore, CC BY-SA 2.0, via Wikimedia Commons
```

The in-game Credits screen points players to this folder for attribution.
