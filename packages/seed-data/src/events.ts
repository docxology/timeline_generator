import type { TemporalEvent } from 'shared';
import { EventType, DatePrecision } from 'shared';

export const seedEvents: TemporalEvent[] = [
    // ═══ R. BUCKMINSTER FULLER ═══
    { id: 'ev-bucky-birth', personId: 'bucky-fuller', type: EventType.BIRTH, title: 'Born in Milton, Massachusetts', date: '1895-07-12', datePrecision: DatePrecision.DAY, place: { city: 'Milton', region: 'Massachusetts', country: 'USA' } },
    { id: 'ev-bucky-harvard1', personId: 'bucky-fuller', type: EventType.EDUCATION, title: 'Entered Harvard University (expelled twice)', date: '1913', datePrecision: DatePrecision.YEAR, endDate: '1915', place: { city: 'Cambridge', region: 'Massachusetts', country: 'USA' } },
    { id: 'ev-bucky-navy', personId: 'bucky-fuller', type: EventType.POSITION, title: 'Served in US Navy', date: '1917', datePrecision: DatePrecision.YEAR, endDate: '1919' },
    { id: 'ev-bucky-marriage', personId: 'bucky-fuller', type: EventType.MILESTONE, title: 'Married Anne Hewlett', date: '1917-07-12', datePrecision: DatePrecision.DAY },
    { id: 'ev-bucky-dymaxion-house', personId: 'bucky-fuller', type: EventType.INVENTION, title: 'First Dymaxion House prototype designed', date: '1929', datePrecision: DatePrecision.YEAR, description: 'Designed the revolutionary factory-assembled Dymaxion House, intended for mass production.' },
    { id: 'ev-bucky-dymaxion-car', personId: 'bucky-fuller', type: EventType.INVENTION, title: 'Dymaxion Car built', date: '1933', datePrecision: DatePrecision.YEAR, description: 'Three-wheeled, aerodynamic vehicle demonstrating Fuller\'s design principles.' },
    { id: 'ev-bucky-bmc', personId: 'bucky-fuller', type: EventType.POSITION, title: 'Summer session at Black Mountain College', date: '1948', datePrecision: DatePrecision.YEAR, endDate: '1949', place: { city: 'Black Mountain', region: 'North Carolina', country: 'USA' }, description: 'Legendary summer sessions where Fuller attempted the first geodesic dome with students.' },
    { id: 'ev-bucky-geodesic-patent', personId: 'bucky-fuller', type: EventType.INVENTION, title: 'Geodesic Dome patent filed', date: '1954-06-29', datePrecision: DatePrecision.DAY, description: 'US Patent No. 2,682,235 for a geodesic dome structure.' },
    { id: 'ev-bucky-siu', personId: 'bucky-fuller', type: EventType.POSITION, title: 'Research Professor at Southern Illinois University', date: '1959', datePrecision: DatePrecision.YEAR, endDate: '1970', place: { city: 'Carbondale', region: 'Illinois', country: 'USA' } },
    { id: 'ev-bucky-norton', personId: 'bucky-fuller', type: EventType.POSITION, title: 'Charles Eliot Norton Professor at Harvard', date: '1961', datePrecision: DatePrecision.YEAR, endDate: '1962', place: { city: 'Cambridge', region: 'Massachusetts', country: 'USA' } },
    { id: 'ev-bucky-world-game', personId: 'bucky-fuller', type: EventType.COLLABORATION, title: 'World Game project initiated with students', date: '1961', datePrecision: DatePrecision.YEAR },
    { id: 'ev-bucky-expo67', personId: 'bucky-fuller', type: EventType.MILESTONE, title: 'Montreal Biosphère at Expo 67', date: '1967', datePrecision: DatePrecision.YEAR, place: { city: 'Montreal', country: 'Canada' }, description: 'The US Pavilion geodesic dome, designed with Shoji Sadao, became an icon of Expo 67.' },
    { id: 'ev-bucky-spaceship-earth', personId: 'bucky-fuller', type: EventType.PUBLICATION, title: 'Published "Operating Manual for Spaceship Earth"', date: '1968', datePrecision: DatePrecision.YEAR },
    { id: 'ev-bucky-synergetics', personId: 'bucky-fuller', type: EventType.PUBLICATION, title: 'Published "Synergetics" with E.J. Applewhite', date: '1975', datePrecision: DatePrecision.YEAR },
    { id: 'ev-bucky-critical-path', personId: 'bucky-fuller', type: EventType.PUBLICATION, title: 'Published "Critical Path"', date: '1981', datePrecision: DatePrecision.YEAR },
    { id: 'ev-bucky-medal', personId: 'bucky-fuller', type: EventType.AWARD, title: 'Presidential Medal of Freedom', date: '1983-02-23', datePrecision: DatePrecision.DAY },
    { id: 'ev-bucky-death', personId: 'bucky-fuller', type: EventType.DEATH, title: 'Died in Los Angeles, California', date: '1983-07-01', datePrecision: DatePrecision.DAY, place: { city: 'Los Angeles', region: 'California', country: 'USA' } },

    // ═══ JOHN CAGE ═══
    { id: 'ev-cage-birth', personId: 'john-cage', type: EventType.BIRTH, title: 'Born in Los Angeles', date: '1912-09-05', datePrecision: DatePrecision.DAY },
    { id: 'ev-cage-bmc', personId: 'john-cage', type: EventType.POSITION, title: 'At Black Mountain College', date: '1948', datePrecision: DatePrecision.YEAR, endDate: '1953' },
    { id: 'ev-cage-433', personId: 'john-cage', type: EventType.PUBLICATION, title: 'Premiered 4\'33"', date: '1952-08-29', datePrecision: DatePrecision.DAY, description: 'Premiered the revolutionary silent composition at Maverick Concert Hall.' },
    { id: 'ev-cage-death', personId: 'john-cage', type: EventType.DEATH, title: 'Died in New York City', date: '1992-08-12', datePrecision: DatePrecision.DAY },

    // ═══ KENNETH SNELSON ═══
    { id: 'ev-snelson-birth', personId: 'kenneth-snelson', type: EventType.BIRTH, title: 'Born in Pendleton, Oregon', date: '1927-06-29', datePrecision: DatePrecision.DAY },
    { id: 'ev-snelson-bmc', personId: 'kenneth-snelson', type: EventType.EDUCATION, title: 'Student at Black Mountain College', date: '1948', datePrecision: DatePrecision.YEAR, endDate: '1949' },
    { id: 'ev-snelson-tensegrity', personId: 'kenneth-snelson', type: EventType.INVENTION, title: 'Created first tensegrity sculpture', date: '1948', datePrecision: DatePrecision.YEAR },
    { id: 'ev-snelson-needle', personId: 'kenneth-snelson', type: EventType.MILESTONE, title: '"Needle Tower" installed at Hirshhorn Museum', date: '1968', datePrecision: DatePrecision.YEAR },
    { id: 'ev-snelson-death', personId: 'kenneth-snelson', type: EventType.DEATH, title: 'Died in New York City', date: '2016-12-22', datePrecision: DatePrecision.DAY },

    // ═══ MARSHALL MCLUHAN ═══
    { id: 'ev-mcluhan-birth', personId: 'marshall-mcluhan', type: EventType.BIRTH, title: 'Born in Edmonton, Alberta', date: '1911-07-21', datePrecision: DatePrecision.DAY },
    { id: 'ev-mcluhan-gutenberg', personId: 'marshall-mcluhan', type: EventType.PUBLICATION, title: 'Published "The Gutenberg Galaxy"', date: '1962', datePrecision: DatePrecision.YEAR },
    { id: 'ev-mcluhan-medium', personId: 'marshall-mcluhan', type: EventType.PUBLICATION, title: 'Published "Understanding Media"', date: '1964', datePrecision: DatePrecision.YEAR },
    { id: 'ev-mcluhan-death', personId: 'marshall-mcluhan', type: EventType.DEATH, title: 'Died in Toronto', date: '1980-12-31', datePrecision: DatePrecision.DAY },

    // ═══ STEWART BRAND ═══
    { id: 'ev-brand-birth', personId: 'stewart-brand', type: EventType.BIRTH, title: 'Born in Rockford, Illinois', date: '1938-12-14', datePrecision: DatePrecision.DAY },
    { id: 'ev-brand-campaign', personId: 'stewart-brand', type: EventType.MILESTONE, title: '"Why haven\'t we seen a photograph of the whole Earth yet?" campaign', date: '1966', datePrecision: DatePrecision.YEAR },
    { id: 'ev-brand-wec', personId: 'stewart-brand', type: EventType.PUBLICATION, title: 'First Whole Earth Catalog published', date: '1968', datePrecision: DatePrecision.YEAR },
    { id: 'ev-brand-longnow', personId: 'stewart-brand', type: EventType.MILESTONE, title: 'Co-founded Long Now Foundation', date: '1996', datePrecision: DatePrecision.YEAR },

    // ═══ NORBERT WIENER ═══
    { id: 'ev-wiener-birth', personId: 'norbert-wiener', type: EventType.BIRTH, title: 'Born in Columbia, Missouri', date: '1894-11-26', datePrecision: DatePrecision.DAY },
    { id: 'ev-wiener-cybernetics', personId: 'norbert-wiener', type: EventType.PUBLICATION, title: 'Published "Cybernetics"', date: '1948', datePrecision: DatePrecision.YEAR, description: 'Foundational text: "Cybernetics: Or Control and Communication in the Animal and the Machine"' },
    { id: 'ev-wiener-death', personId: 'norbert-wiener', type: EventType.DEATH, title: 'Died in Stockholm, Sweden', date: '1964-03-18', datePrecision: DatePrecision.DAY },

    // ═══ ALBERT EINSTEIN ═══
    { id: 'ev-einstein-birth', personId: 'albert-einstein', type: EventType.BIRTH, title: 'Born in Ulm, Germany', date: '1879-03-14', datePrecision: DatePrecision.DAY },
    { id: 'ev-einstein-relativity', personId: 'albert-einstein', type: EventType.PUBLICATION, title: 'Published General Theory of Relativity', date: '1915-11-25', datePrecision: DatePrecision.DAY },
    { id: 'ev-einstein-nobel', personId: 'albert-einstein', type: EventType.AWARD, title: 'Nobel Prize in Physics', date: '1921', datePrecision: DatePrecision.YEAR },
    { id: 'ev-einstein-death', personId: 'albert-einstein', type: EventType.DEATH, title: 'Died in Princeton, NJ', date: '1955-04-18', datePrecision: DatePrecision.DAY },

    // ═══ ISAMU NOGUCHI ═══
    { id: 'ev-noguchi-birth', personId: 'isamu-noguchi', type: EventType.BIRTH, title: 'Born in Los Angeles', date: '1904-11-17', datePrecision: DatePrecision.DAY },
    { id: 'ev-noguchi-death', personId: 'isamu-noguchi', type: EventType.DEATH, title: 'Died in New York City', date: '1988-12-30', datePrecision: DatePrecision.DAY },

    // ═══ WALTER GROPIUS ═══
    { id: 'ev-gropius-birth', personId: 'walter-gropius', type: EventType.BIRTH, title: 'Born in Berlin, Germany', date: '1883-05-18', datePrecision: DatePrecision.DAY },
    { id: 'ev-gropius-bauhaus', personId: 'walter-gropius', type: EventType.MILESTONE, title: 'Founded the Bauhaus', date: '1919', datePrecision: DatePrecision.YEAR },
    { id: 'ev-gropius-death', personId: 'walter-gropius', type: EventType.DEATH, title: 'Died in Boston, Massachusetts', date: '1969-07-05', datePrecision: DatePrecision.DAY },
];
