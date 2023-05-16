import { SiteConfig } from 'config/definitions/sites';

export const MAXIV: SiteConfig[] = [
  {
    name: 'MAXIV-java',
    description: 'For MX',
    javaName: 'MAXIV',
    host: 'https://ispyb-test.maxiv.lu.se',
    apiPrefix: '/ispyb/ispyb-ws/rest',
    javaMode: true,
    javaConfig: {
      techniques: {
        MX: {
          beamlines: [
            { name: 'BioMAX', sampleChangerType: 'ISARA' },
            { name: 'MicroMAX', sampleChangerType: 'ISARA' },
          ],
        },
      },
    },
  },
];
