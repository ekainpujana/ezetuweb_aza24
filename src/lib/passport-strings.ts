import type { LangCode } from './types';

export type PassportLang = 'es' | 'eu' | 'en' | 'pt' | 'fr' | 'it' | 'de';

const STRINGS = {
  passportTitle: { es: 'Mi Pasaporte', eu: 'Nire Pasaportea', en: 'My Passport', pt: 'O Meu Passaporte' },
  passportSubtitle: { es: 'Tu viaje, tu progreso y tus fotos en un solo lugar', eu: 'Zure bidaiak, zure esperientzia eta zure argazkiak, dena leku bakarrean', en: 'Your travels, progress and photos in one place', pt: 'As tuas viagens, o teu progresso e as tuas fotos num só lugar' },
  changePhoto: { es: 'Cambiar foto', eu: 'Aldatu argazkia', en: 'Change photo', pt: 'Alterar foto' },
  removePhoto: { es: 'Quitar foto', eu: 'Kendu argazkia', en: 'Remove photo', pt: 'Remover foto' },
  levelHelp: { es: '¿Cómo subir de nivel?', eu: 'Nola igo mailaz?', en: 'How do I level up?', pt: 'Como subir de nível?' },
  levelHelpTitle: { es: 'Cómo subir de nivel', eu: 'Nola igo mailaz', en: 'How to level up', pt: 'Como subir de nível' },
  xpRulesTitle: { es: 'Cómo ganas XP', eu: 'Nola irabazten duzun XP', en: 'How you earn XP', pt: 'Como ganhas XP' },
  ruleVisit: { es: 'Rincón visitado', eu: 'Bisitatutako lekua', en: 'Spot visited', pt: 'Recanto visitado' },
  ruleReview: { es: 'Reseña escrita', eu: 'Idatzitako iritzia', en: 'Review written', pt: 'Avaliação escrita' },
  rulePhoto: { es: 'Foto subida', eu: 'Igotako argazkia', en: 'Photo uploaded', pt: 'Foto carregada' },
  rulePhotoLike: { es: 'Like en tus fotos', eu: 'Zure argazkien like-a', en: 'Like on your photos', pt: 'Gosto nas tuas fotos' },
  rulePioneer: { es: 'Rincón nuevo registrado', eu: 'Erregistratutako leku berria', en: 'New spot registered', pt: 'Novo recanto registado' },
  levelsTitle: { es: 'Niveles', eu: 'Mailak', en: 'Levels', pt: 'Níveis' },
  levelLabel: { es: 'Nivel {n}', eu: '{n}. maila', en: 'Level {n}', pt: 'Nível {n}' },
  xpCurrent: { es: '{xp} XP', eu: '{xp} XP', en: '{xp} XP', pt: '{xp} XP' },
  xpNext: { es: 'Te faltan {n} XP para {level}', eu: '{n} XP falta zaizkizu {level} mailara', en: '{n} XP to go until {level}', pt: 'Faltam-te {n} XP para {level}' },
  xpMax: { es: 'Has alcanzado el nivel máximo', eu: 'Maila gorena lortu duzu', en: 'You have reached the top level', pt: 'Alcançaste o nível máximo' },
  followersBtn: { es: 'Seguidores', eu: 'Jarraitzaileak', en: 'Followers', pt: 'Seguidores' },
  followingBtn: { es: 'Siguiendo', eu: 'Jarraitzen', en: 'Following', pt: 'A seguir' },
  followersTitle: { es: 'Tus seguidores', eu: 'Zure jarraitzaileak', en: 'Your followers', pt: 'Os teus seguidores' },
  followingTitle: { es: 'A quién sigues', eu: 'Nor jarraitzen duzun', en: 'Who you follow', pt: 'Quem estás a seguir' },
  viewProfile: { es: 'Ver perfil', eu: 'Profila ikusi', en: 'View profile', pt: 'Ver perfil' },
  unfollow: { es: 'Dejar de seguir', eu: 'Utzi jarraitzeari', en: 'Unfollow', pt: 'Deixar de seguir' },
  emptyList: { es: 'No hay nadie en esta lista', eu: 'Zerrenda honetan ez dago inor', en: 'Nobody in this list', pt: 'Ninguém nesta lista' },
  followingEmpty: { es: "Aún no sigues a ningún viajero. Descubre fotógrafos en la galería y pulsa 'Seguir'.", eu: "Oraindik ez duzu bidaiaririk jarraitzen. Arakatu galeria eta sakatu 'Jarraitu'.", en: "You are not following any travelers yet. Explore the gallery and tap 'Follow'.", pt: "Ainda não segues nenhum viajante. Descobre fotógrafos na galeria e toca em 'Seguir'." },
  close: { es: 'Cerrar', eu: 'Itxi', en: 'Close', pt: 'Fechar' },
  loadError: { es: 'No pudimos cargar tus datos. Inténtalo de nuevo más tarde.', eu: 'Ezin izan ditugu zure datuak kargatu. Saiatu berriro geroago.', en: 'We could not load your data. Please try again later.', pt: 'Não foi possível carregar os teus dados. Tenta novamente mais tarde.' },
  levelBadge: { es: 'Nivel {level}: {levelName} ({xp} XP)', eu: '{level}. Maila: {levelName} ({xp} XP)', en: 'Level {level}: {levelName} ({xp} XP)', pt: 'Nível {level}: {levelName} ({xp} XP)' },

  conquestTitle: { es: 'Metas de conquista', eu: 'Konkista helburuak', en: 'Conquest goals', pt: 'Metas de conquista' },
  continentsMetric: { es: 'Continentes', eu: 'Kontinenteak', en: 'Continents', pt: 'Continentes' },
  capitalsMetric: { es: 'Capitales del mundo', eu: 'Munduko hiriburuak', en: 'World capitals', pt: 'Capitais do mundo' },
  worldMetric: { es: 'Mundo conquistado', eu: 'Munduaren konkista', en: 'World conquered', pt: 'Mundo conquistado' },
  likesMetric: { es: 'Likes totales de la comunidad', eu: 'Komunitatearen like guztiak', en: 'Total community likes', pt: 'Gostos totais da comunidade' },
  countriesSuffix: { es: 'países (%{pct})', eu: 'herrialde (%{pct})', en: 'countries (%{pct})', pt: 'países (%{pct})' },
  countriesModalTitle: { es: '{total} Países del Mundo', eu: '{total} Munduko Herrialdeak', en: '{total} Countries of the World', pt: '{total} Países do Mundo' },
  mapTitle: { es: 'Mi mapa', eu: 'Nire mapa', en: 'My map', pt: 'O meu mapa' },
  searchPlaceholder: { es: 'Buscar país o capital', eu: 'Bilatu herrialdea edo hiriburua', en: 'Search country or capital', pt: 'Pesquisar país ou capital' },
  noResults: { es: 'No hay resultados para tu búsqueda', eu: 'Ez dago emaitzarik zure bilaketarako', en: 'No results for your search', pt: 'Sem resultados para a tua pesquisa' },
  lockedHint: { es: 'Explora para desbloquear', eu: 'Esploratu desblokeatzeko', en: 'Explore to unlock', pt: 'Explora para desbloquear' },
  likesHint: { es: 'Suma de likes en todas tus fotos', eu: 'Zure argazki guztien like-en batura', en: 'Sum of likes on all your photos', pt: 'Soma de gostos em todas as tuas fotos' },
  checklistVisited: { es: 'Visitados', eu: 'Bisitatuak', en: 'Visited', pt: 'Visitados' },
  checklistPending: { es: 'Pendientes', eu: 'Falta direnak', en: 'Pending', pt: 'Pendentes' },
  exploreBtn: { es: 'Explorar en el mapa', eu: 'Esploratu mapan', en: 'Explore on the map', pt: 'Explorar no mapa' },
  continentsModalTitle: { es: 'Continentes', eu: 'Kontinenteak', en: 'Continents', pt: 'Continentes' },
  capitalsModalTitle: { es: 'Capitales del mundo', eu: 'Munduko hiriburuak', en: 'World capitals', pt: 'Capitais do mundo' },
  cont_eu: { es: 'Europa', eu: 'Europa', en: 'Europe', pt: 'Europa' },
  cont_as: { es: 'Asia', eu: 'Asia', en: 'Asia', pt: 'Ásia' },
  cont_af: { es: 'África', eu: 'Afrika', en: 'Africa', pt: 'África' },
  cont_am: { es: 'América', eu: 'Amerika', en: 'Americas', pt: 'América' },
  cont_oc: { es: 'Oceanía', eu: 'Ozeania', en: 'Oceania', pt: 'Oceânia' },
  cont_an: { es: 'Antártida', eu: 'Antartika', en: 'Antarctica', pt: 'Antártida' },

  retosTitle: { es: 'Retos', eu: 'Erronkak', en: 'Challenges', pt: 'Desafios' },
  retoName_alma: { es: 'Alma de Pueblo', eu: 'Herriaren arima', en: 'Village Soul', pt: 'Alma de Aldeia' },
  retoDesc_alma: { es: 'Pueblos', eu: 'Herriak', en: 'Villages', pt: 'Aldeias' },
  retoName_hiritarra: { es: 'Cosmopolita', eu: 'Hiritarra', en: 'Urbanite', pt: 'Cosmopolita' },
  retoDesc_hiritarra: { es: 'Ciudades', eu: 'Hiriak', en: 'Cities', pt: 'Cidades' },
  retoName_naturazalea: { es: 'Amante de la Naturaleza', eu: 'Naturazalea', en: 'Nature Lover', pt: 'Amante da Natureza' },
  retoDesc_naturazalea: { es: 'Parajes naturales', eu: 'Natura-parajeak', en: 'Nature spots', pt: 'Paragens naturais' },
  retoName_kartografoa: { es: 'El Cartógrafo', eu: 'Kartografoa', en: 'Cartographer', pt: 'O Cartógrafo' },
  retoDesc_kartografoa: { es: 'Nuevos rincones registrados', eu: 'Erregistratutako leku berriak', en: 'New spots registered', pt: 'Novos recantos registados' },
  retoName_ojo: { es: 'Ojo de Fotógrafo', eu: 'Argazkilariaren begia', en: 'Photographer Eye', pt: 'Olho de Fotógrafo' },
  retoDesc_ojo: { es: 'Fotos publicadas', eu: 'Argitaratutako argazkiak', en: 'Published photos', pt: 'Fotos publicadas' },
  retoName_guia: { es: 'Guía de viajes', eu: 'Bidaia-gida', en: 'Travel Guide', fr: 'Guide de voyage', it: 'Guida di viaggio', de: 'Reiseführer', pt: 'Guia de viagens' },
  retoDesc_guia: { es: 'Lugares valorados', eu: 'Balorazioak', en: 'Places reviewed', pt: 'Lugares avaliados' },
  tierBronze: { es: 'Bronce', eu: 'Brontzea', en: 'Bronze', pt: 'Bronze' },
  tierSilver: { es: 'Plata', eu: 'Zilarra', en: 'Silver', pt: 'Prata' },
  tierGold: { es: 'Oro', eu: 'Urrea', en: 'Gold', pt: 'Ouro' },
  tierPlatinum: { es: 'Platino', eu: 'Platinoa', en: 'Platinum', pt: 'Platina' },
  tierLegend: { es: 'Leyenda', eu: 'Kondaira', en: 'Legend', pt: 'Lenda' },
  nextTier: { es: '{value} / {total} para {tier}', eu: '{value} / {total} {tier} lortzeko', en: '{value} / {total} to {tier}', pt: '{value} / {total} para {tier}' },
  tierDone: { es: 'Reto completado', eu: 'Erronka osatuta', en: 'Challenge completed', pt: 'Desafio concluído' },
  tierNone: { es: 'Sin medalla todavía', eu: 'Oraindik domina gabe', en: 'No medal yet', pt: 'Ainda sem medalha' },

  portfolioTitle: { es: 'Mi portafolio y palmarés', eu: 'Nire Argazkiak', en: 'My Photography & Awards', pt: 'O meu portfólio e prémios' },
  trophiesTitle: { es: 'Palmarés', eu: 'Sarituak', en: 'Awards', pt: 'Palmarés' },
  noTrophies: { es: 'Aún no tienes premios', eu: 'Saririk irabazi gabe zaude', en: 'No awards yet', pt: 'Ainda não tens prémios' },
  awardMonth: { es: 'Foto del Mes', eu: 'Hilabeteko argazkia', en: 'Photo of the Month', pt: 'Foto do Mês' },
  awardYear: { es: 'Foto del Año', eu: 'Urteko argazkia', en: 'Photo of the Year', pt: 'Foto do Ano' },
  medalGold: { es: 'Oro', eu: 'Urrezkoa', en: 'Gold', pt: 'Ouro' },
  medalSilver: { es: 'Plata', eu: 'Zilarrezkoa', en: 'Silver', pt: 'Prata' },
  medalBronze: { es: 'Bronce', eu: 'Brontzezkoa', en: 'Bronze', pt: 'Bronze' },
  masterpieceTitle: { es: 'Obra Maestra', eu: 'Obra maisua', en: 'Masterpiece', pt: 'Obra-prima' },
  likesCount: { es: '{n} likes', eu: '{n} like', en: '{n} likes', pt: '{n} gostos' },
  noPhotos: { es: 'Aún no has subido fotos', eu: 'Oraindik ez duzu argazkirik igo', en: 'You have not uploaded any photos yet', pt: 'Ainda não carregaste fotos' },
  sortVotes: { es: 'Más votadas', eu: 'Gehien bozkatuak', en: 'Most voted', pt: 'Mais votadas' },
  sortAwards: { es: 'Premiadas', eu: 'Sarituak', en: 'Awarded', pt: 'Premiadas' },
  sortRecent: { es: 'Recientes', eu: 'Berrienak', en: 'Recent', pt: 'Recentes' },

  rankingTitle: { es: 'Mis rincones conquistados en el ranking mundial', eu: 'Egondako lekuak rankingaren arabera', en: 'My conquered spots in the world ranking', pt: 'Os meus recantos conquistados no ranking mundial' },
  filterAll: { es: 'Todos', eu: 'Guztiak', en: 'All', pt: 'Todos' },
  filterCities: { es: 'Ciudades', eu: 'Hiriak', en: 'Cities', pt: 'Cidades' },
  filterVillages: { es: 'Pueblos', eu: 'Herriak', en: 'Villages', pt: 'Aldeias' },
  filterNature: { es: 'Naturaleza', eu: 'Natura', en: 'Nature', pt: 'Natureza' },
  viewOnMapBtn: { es: 'Ver en el mapa', eu: 'Ikusi mapan', en: 'View on map', pt: 'Ver no mapa' },
  emptySpots: { es: 'Aún no has visitado ningún rincón', eu: 'Oraindik ez duzu lekurik bisitatu', en: 'You have not visited any spots yet', pt: 'Ainda não visitaste nenhum recanto' },
  noMatches: { es: 'No hay rincones en esta categoría', eu: 'Kategoria honetan ez dago lekurik', en: 'No spots in this category', pt: 'Não há recantos nesta categoria' },
  loadMore: { es: 'Mostrar más', eu: 'Erakutsi gehiago', en: 'Show more', pt: 'Mostrar mais' },
  showingCounter: { es: 'Mostrando {current} de {total}', eu: '{total}-(e)tik {current} erakusten', en: 'Showing {current} of {total}', pt: 'A mostrar {current} de {total}' },
} as const;

export type PassportKey = keyof typeof STRINGS;

export function toPassportLang(code: LangCode): PassportLang {
  if (code === 'EUS') return 'eu';
  if (code === 'ES') return 'es';
  if (code === 'FR') return 'fr';
  if (code === 'IT') return 'it';
  if (code === 'DE') return 'de';
  if (code === 'PT') return 'pt';
  return 'en';
}

export function passportLocale(lang: PassportLang): string {
  if (lang === 'es') return 'es-ES';
  if (lang === 'eu') return 'eu-ES';
  if (lang === 'fr') return 'fr-FR';
  if (lang === 'it') return 'it-IT';
  if (lang === 'de') return 'de-DE';
  if (lang === 'pt') return 'pt-PT';
  return 'en-US';
}

export function createPassportT(lang: PassportLang) {
  return (key: PassportKey, vars?: Record<string, string | number>): string => {
    const entry = STRINGS[key] as Record<string, string>;
    let text: string = entry[lang] ?? entry.en;
    if (vars) for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
    return text;
  };
}

export type PassportT = ReturnType<typeof createPassportT>;