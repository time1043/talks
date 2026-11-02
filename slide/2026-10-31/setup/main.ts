import '../styles/deck.css'

export default function main() {
  // Global styles are injected from ../styles/deck.css, early enough to load
  // before the theme (Slidev's auto-loaded stylesheet loads after it and would
  // otherwise win ties, changing the reviewed layout).
}
