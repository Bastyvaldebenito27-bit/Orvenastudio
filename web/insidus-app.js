(function(){
"use strict";
var PHOTOS={"calamar": "https://valrey.cl/wp-content/uploads/elementor/thumbs/calamar-1-ojcpewpjpka1aog9yex2f5upr5af254potj8cj19lc.jpg", "albacora": "https://valrey.cl/wp-content/uploads/elementor/thumbs/albacora-1-ojcpe3kjtp65armlokbmrv7fc7a1fix18tb6gy8gy8.jpg", "merluza-austral": "https://valrey.cl/wp-content/uploads/elementor/thumbs/merluza-austral-1-ojcpf3af1ej1jy6pvzrgem6xwudzk0uu1q3mpgrids.jpg", "merluza-gayi": "https://valrey.cl/wp-content/uploads/elementor/thumbs/merluza-gayi-1-ojcpfbqyqwumgfufilf3j2239b8ahasf2vz00yeyts.jpg", "reineta": "https://valrey.cl/wp-content/uploads/elementor/thumbs/reineta-ojcpegqahdo5tb3hjq0eqrvvnlh6fad9ymfz6toyj4.jpg", "jaiba": "https://valrey.cl/wp-content/uploads/elementor/thumbs/Fotos-Web-_0002_Foto-23-11-18-20-56-54-4-ojax0nfbzerb0vumyc1qu60afvoqw5t2yiby8oc7o0.jpg", "locos": "https://valrey.cl/wp-content/uploads/elementor/thumbs/Locos_0001_image3-ojax1gkbv9v70sob86n6hgnkutp4is0reik04950b4.jpg", "bacalao": "https://cdn.jsdelivr.net/gh/Bastyvaldebenito27-bit/Orvenastudio@main/fotos/bacalao-hi.jpg"},SHOTS={"hero": "https://cdn.jsdelivr.net/gh/Bastyvaldebenito27-bit/Orvenastudio@main/fotos/hero.jpg", "proceso": "https://cdn.jsdelivr.net/gh/Bastyvaldebenito27-bit/Orvenastudio@main/fotos/proceso.jpg", "hielo": "https://cdn.jsdelivr.net/gh/Bastyvaldebenito27-bit/Orvenastudio@main/fotos/hielo.jpg", "corte": "https://cdn.jsdelivr.net/gh/Bastyvaldebenito27-bit/Orvenastudio@main/fotos/corte.jpg", "embarque": "https://cdn.jsdelivr.net/gh/Bastyvaldebenito27-bit/Orvenastudio@main/fotos/embarque.jpg"},SPECIES=[{"id": "calamar", "es": "CALAMAR", "trade": "Jibia · Squid", "bino": "Dosidicus gigas"}, {"id": "bacalao", "es": "BACALAO", "trade": "Chilean Seabass · Toothfish", "bino": "Dissostichus eleginoides"}, {"id": "albacora", "es": "ALBACORA", "trade": "Pez Espada · Swordfish", "bino": "Xiphias gladius"}, {"id": "merluza-austral", "es": "MERLUZA AUSTRAL", "trade": "Southern Hake", "bino": "Merluccius australis"}, {"id": "merluza-gayi", "es": "MERLUZA GAYI", "trade": "South Pacific Hake", "bino": "Merluccius gayi"}, {"id": "reineta", "es": "REINETA", "trade": "Pacific Pomfret", "bino": "Brama australis"}, {"id": "jaiba", "es": "JAIBA", "trade": "Rock Crab", "bino": "Cancer spp."}, {"id": "locos", "es": "LOCOS", "trade": "Chilean Abalone", "bino": "Concholepas concholepas"}],
I18N={"es":{"eyebrow":"Exportación de productos del mar","scroll":"Desliza","cta":"Hablemos","nav":["Nosotros","Productos","Planta","Equipo","Contacto"],"claims":["Productos de calidad","Expertos en productos del mar","Pesca sustentable y artesanal","La satisfacción de nuestros clientes es nuestra meta"],"about":["Del Pacífico Sur al mundo","Nacemos de la experiencia en el rubro pesquero de Luis Bonilla C., quien tras veinte años en el sector decidió llegar directo al cliente final. Esa trayectoria y la confianza de los proveedores nacionales se reflejaron primero en la producción de calamar, y luego en un equipo capaz de internacionalizar la compañía.","Nuestras costas chilenas, de gélidas aguas del océano Pacífico, nos brindan productos de calidad única."],"statLabels":["Países","Puntos de venta","Años de trayectoria"],"products":["Nuestros productos","A lo largo de los 6.435 km de costa chilena, las aguas frías del Pacífico entregan una variedad excepcional. Estas son las especies que producimos."],"clientsEyebrow":"Clientes","clients":"Lo que dicen nuestros clientes","quotes":[["Sigan produciendo productos de calidad, su producto llena todas nuestras expectativas","Nam Cho","China"],["Productos de calidad y grandes socios por siempre","Joon Yang","Corea del Sur"],["Grandes amigos míos, producto único y de calidad","José Luis Martínez","España"],["La mejor calidad, feliz de trabajar juntos","Kim Moon","Filipinas"]],"plant":["Nuestra planta","Emplazada en San Antonio, V Región, con más de 1.350 m² construidos y equipamiento de última generación en congelación y refrigeración.","Está diseñada para favorecer la velocidad del proceso, con operaciones unitarias de personal especializado en los distintos cortes, para obtener los productos finales que cada cliente requiere."],"plantRows":["Superficie construida","Capacidad de congelación","Ubicación"],"team":["Nuestro equipo","Buscamos entregar la mejor calidad al cliente. La excelencia en el servicio, una planta con tecnología de vanguardia y un grupo de profesionales calificados nos han permitido construir relaciones de confianza a lo largo del tiempo y del mundo."],"roles":["Director Manager","General Manager","General Finance","Chief Operations"],"contact":["Contacto","Indícanos especie, formato y volumen. Respondemos con disponibilidad y precio."],"contactRows":["Dirección","Correo","Teléfono"],"foot":"Todos los derechos reservados.","captions":["Bacalao de profundidad en sala de proceso","Recepción en hielo","Sala de proceso","Corte y control de calidad","Contenedor cargado para embarque"],"dragHint":"Arrastra","chain":["DEL OCÉANO","AL PROCESO","AL CORTE","AL MUNDO"],"askLabel":"Consultar","mailSubject":"Consulta: {s}","mailBody":"Hola, me interesa {s}. ¿Podrían indicarme disponibilidad, formatos y precio?\n\nVolumen estimado:\nDestino:\n\nGracias.","mailGeneral":"Consulta comercial"},"en":{"eyebrow":"Seafood export","scroll":"Scroll","cta":"Let's talk","nav":["About","Products","Plant","Team","Contact"],"claims":["Quality products","Experts in seafood","Sustainable, small-scale fishing","Our clients' satisfaction is our goal"],"about":["From the South Pacific to the world","We grew out of Luis Bonilla C.'s experience in fisheries. After twenty years in the sector he decided to reach the end client directly. That track record, and the trust of Chilean suppliers, showed first in squid production and then in a team built to take the company international.","Our Chilean coast, and the cold waters of the Pacific, give us product of a quality found nowhere else."],"statLabels":["Countries","Points of sale","Years trading"],"products":["Our products","Along 6,435 km of Chilean coast, the cold Pacific yields an exceptional range. These are the species we produce."],"clientsEyebrow":"Clients","clients":"What our clients say","quotes":[["Keep producing quality product — it meets every one of our expectations","Nam Cho","China"],["Quality products and great partners, always","Joon Yang","South Korea"],["Great friends of mine, unique product and real quality","José Luis Martínez","Spain"],["The best quality, glad to be working together","Kim Moon","Philippines"]],"plant":["Our plant","Located in San Antonio, Valparaíso Region, with over 1,350 m² built and state-of-the-art freezing and refrigeration equipment.","It is laid out for process speed, with unit operations run by staff specialised in each cut, to reach the finished product each client requires."],"plantRows":["Built area","Freezing capacity","Location"],"team":["Our team","Our aim is to deliver the best possible quality. Service excellence, a plant with current technology and a qualified team have let us build lasting relationships across time and across the world."],"roles":["Director Manager","General Manager","General Finance","Chief Operations"],"contact":["Contact","Tell us the species, format and volume you need. We reply with availability and pricing."],"contactRows":["Address","Email","Phone"],"foot":"All rights reserved.","captions":["Chilean seabass in the process room","Reception on ice","Process room","Cutting and quality control","Container loaded for shipping"],"dragHint":"Drag","chain":["FROM THE OCEAN","TO THE PLANT","TO THE CUT","TO THE WORLD"],"askLabel":"Enquire","mailSubject":"Enquiry: {s}","mailBody":"Hello, I am interested in {s}. Could you send availability, formats and pricing?\n\nEstimated volume:\nDestination:\n\nThank you.","mailGeneral":"Commercial enquiry"},"fr":{"eyebrow":"Exportation de produits de la mer","scroll":"Défiler","cta":"Parlons-en","nav":["À propos","Produits","Usine","Équipe","Contact"],"claims":["Des produits de qualité","Experts des produits de la mer","Pêche durable et artisanale","La satisfaction de nos clients est notre objectif"],"about":["Du Pacifique Sud au monde","Nous sommes nés de l'expérience de Luis Bonilla C. dans la pêche. Après vingt ans dans le secteur, il a choisi d'atteindre directement le client final. Ce parcours, et la confiance des fournisseurs chiliens, s'est traduit d'abord par la production d'encornet, puis par une équipe capable d'internationaliser l'entreprise.","Nos côtes chiliennes, et les eaux glacées du Pacifique, nous donnent des produits d'une qualité unique."],"statLabels":["Pays","Points de vente","Ans d'activité"],"products":["Nos produits","Sur les 6 435 km de côte chilienne, les eaux froides du Pacifique offrent une variété exceptionnelle. Voici les espèces que nous produisons."],"clientsEyebrow":"Clients","clients":"Ce que disent nos clients","quotes":[["Continuez à produire de la qualité — votre produit répond à toutes nos attentes","Nam Cho","Chine"],["Des produits de qualité et de grands partenaires, pour toujours","Joon Yang","Corée du Sud"],["De grands amis, un produit unique et de qualité","José Luis Martínez","Espagne"],["La meilleure qualité, heureux de travailler ensemble","Kim Moon","Philippines"]],"plant":["Notre usine","Située à San Antonio, région de Valparaíso, avec plus de 1 350 m² construits et un équipement de congélation et de réfrigération de dernière génération.","Elle est conçue pour la rapidité du process, avec des opérations unitaires confiées à un personnel spécialisé dans chaque découpe, afin d'obtenir le produit fini demandé par chaque client."],"plantRows":["Surface construite","Capacité de congélation","Emplacement"],"team":["Notre équipe","Notre objectif est d'offrir la meilleure qualité. L'excellence du service, une usine à la technologie actuelle et une équipe qualifiée nous ont permis de bâtir des relations de confiance dans le temps et dans le monde."],"roles":["Director Manager","General Manager","General Finance","Chief Operations"],"contact":["Contact","Indiquez-nous l'espèce, le format et le volume. Nous répondons avec disponibilité et prix."],"contactRows":["Adresse","E-mail","Téléphone"],"foot":"Tous droits réservés.","captions":["Légine australe en salle de transformation","Réception sous glace","Salle de transformation","Découpe et contrôle qualité","Conteneur chargé pour expédition"],"dragHint":"Faites glisser","chain":["DE L'OCÉAN","À L'USINE","À LA DÉCOUPE","AU MONDE"],"askLabel":"Demander","mailSubject":"Demande : {s}","mailBody":"Bonjour, je m'intéresse à {s}. Pourriez-vous m'indiquer disponibilité, formats et prix ?\n\nVolume estimé :\nDestination :\n\nMerci.","mailGeneral":"Demande commerciale"},"pt":{"eyebrow":"Exportação de produtos do mar","scroll":"Role","cta":"Vamos conversar","nav":["Sobre","Produtos","Planta","Equipe","Contato"],"claims":["Produtos de qualidade","Especialistas em produtos do mar","Pesca sustentável e artesanal","A satisfação dos nossos clientes é a nossa meta"],"about":["Do Pacífico Sul para o mundo","Nascemos da experiência de Luis Bonilla C. no setor pesqueiro. Depois de vinte anos na área, decidiu chegar direto ao cliente final. Essa trajetória, e a confiança dos fornecedores chilenos, apareceu primeiro na produção de lula e depois numa equipe capaz de internacionalizar a companhia.","Nossas costas chilenas, de águas gélidas do Pacífico, nos dão produtos de qualidade única."],"statLabels":["Países","Pontos de venda","Anos de trajetória"],"products":["Nossos produtos","Ao longo dos 6.435 km de costa chilena, as águas frias do Pacífico entregam uma variedade excepcional. Estas são as espécies que produzimos."],"clientsEyebrow":"Clientes","clients":"O que dizem nossos clientes","quotes":[["Continuem produzindo qualidade — o produto atende a todas as nossas expectativas","Nam Cho","China"],["Produtos de qualidade e grandes parceiros, sempre","Joon Yang","Coreia do Sul"],["Grandes amigos meus, produto único e de qualidade","José Luis Martínez","Espanha"],["A melhor qualidade, feliz de trabalhar juntos","Kim Moon","Filipinas"]],"plant":["Nossa planta","Situada em San Antonio, Região de Valparaíso, com mais de 1.350 m² construídos e equipamento de última geração em congelamento e refrigeração.","Foi projetada para favorecer a velocidade do processo, com operações unitárias de pessoal especializado nos diferentes cortes, para obter o produto final que cada cliente requer."],"plantRows":["Área construída","Capacidade de congelamento","Localização"],"team":["Nossa equipe","Buscamos entregar a melhor qualidade ao cliente. A excelência no serviço, uma planta com tecnologia de vanguarda e profissionais qualificados nos permitiram construir relações de confiança ao longo do tempo e do mundo."],"roles":["Director Manager","General Manager","General Finance","Chief Operations"],"contact":["Contato","Informe espécie, formato e volume. Respondemos com disponibilidade e preço."],"contactRows":["Endereço","E-mail","Telefone"],"foot":"Todos os direitos reservados.","captions":["Merluza negra na sala de processo","Recepção em gelo","Sala de processo","Corte e controle de qualidade","Contêiner carregado para embarque"],"dragHint":"Arraste","chain":["DO OCEANO","À PLANTA","AO CORTE","AO MUNDO"],"askLabel":"Consultar","mailSubject":"Consulta: {s}","mailBody":"Olá, tenho interesse em {s}. Poderiam informar disponibilidade, formatos e preço?\n\nVolume estimado:\nDestino:\n\nObrigado.","mailGeneral":"Consulta comercial"},"it":{"eyebrow":"Esportazione di prodotti ittici","scroll":"Scorri","cta":"Parliamone","nav":["Chi siamo","Prodotti","Stabilimento","Team","Contatti"],"claims":["Prodotti di qualità","Esperti in prodotti ittici","Pesca sostenibile e artigianale","La soddisfazione dei nostri clienti è il nostro obiettivo"],"about":["Dal Pacifico del Sud al mondo","Nasciamo dall'esperienza di Luis Bonilla C. nel settore ittico. Dopo vent'anni nel comparto ha scelto di arrivare direttamente al cliente finale. Quel percorso, e la fiducia dei fornitori cileni, si è visto prima nella produzione di calamaro e poi in un team capace di internazionalizzare l'azienda.","Le nostre coste cilene, con le acque gelide del Pacifico, ci danno prodotti di qualità unica."],"statLabels":["Paesi","Punti vendita","Anni di attività"],"products":["I nostri prodotti","Lungo i 6.435 km di costa cilena, le acque fredde del Pacifico offrono una varietà eccezionale. Queste sono le specie che produciamo."],"clientsEyebrow":"Clienti","clients":"Cosa dicono i nostri clienti","quotes":[["Continuate a produrre qualità — il vostro prodotto soddisfa ogni nostra aspettativa","Nam Cho","Cina"],["Prodotti di qualità e grandi partner, per sempre","Joon Yang","Corea del Sud"],["Grandi amici miei, prodotto unico e di qualità","José Luis Martínez","Spagna"],["La migliore qualità, felice di lavorare insieme","Kim Moon","Filippine"]],"plant":["Il nostro stabilimento","Situato a San Antonio, Regione di Valparaíso, con oltre 1.350 m² costruiti e impianti di congelamento e refrigerazione di ultima generazione.","È progettato per favorire la velocità del processo, con operazioni unitarie affidate a personale specializzato nei diversi tagli, per ottenere il prodotto finito richiesto da ogni cliente."],"plantRows":["Superficie costruita","Capacità di congelamento","Ubicazione"],"team":["Il nostro team","Vogliamo offrire al cliente la migliore qualità. L'eccellenza del servizio, uno stabilimento con tecnologia attuale e professionisti qualificati ci hanno permesso di costruire rapporti di fiducia nel tempo e nel mondo."],"roles":["Director Manager","General Manager","General Finance","Chief Operations"],"contact":["Contatti","Indicaci specie, formato e volume. Rispondiamo con disponibilità e prezzo."],"contactRows":["Indirizzo","E-mail","Telefono"],"foot":"Tutti i diritti riservati.","captions":["Austromerluzzo in sala di lavorazione","Ricezione sotto ghiaccio","Sala di lavorazione","Taglio e controllo qualità","Container caricato per la spedizione"],"dragHint":"Trascina","chain":["DALL'OCEANO","ALLO STABILIMENTO","AL TAGLIO","AL MONDO"],"askLabel":"Richiedi","mailSubject":"Richiesta: {s}","mailBody":"Buongiorno, sono interessato a {s}. Potreste indicarmi disponibilità, formati e prezzo?\n\nVolume stimato:\nDestinazione:\n\nGrazie.","mailGeneral":"Richiesta commerciale"},"de":{"eyebrow":"Export von Meeresprodukten","scroll":"Scrollen","cta":"Sprechen wir","nav":["Über uns","Produkte","Werk","Team","Kontakt"],"claims":["Produkte in Qualität","Experten für Meeresprodukte","Nachhaltige, handwerkliche Fischerei","Die Zufriedenheit unserer Kunden ist unser Ziel"],"about":["Vom Südpazifik in die Welt","Wir sind aus der Erfahrung von Luis Bonilla C. in der Fischerei entstanden. Nach zwanzig Jahren in der Branche entschied er sich, den Endkunden direkt zu erreichen. Dieser Weg und das Vertrauen chilenischer Lieferanten zeigten sich zuerst in der Kalmarproduktion und dann in einem Team, das das Unternehmen internationalisiert hat.","Unsere chilenische Küste und die eiskalten Wasser des Pazifiks geben uns Produkte von einzigartiger Qualität."],"statLabels":["Länder","Verkaufsstellen","Jahre am Markt"],"products":["Unsere Produkte","Entlang der 6.435 km chilenischer Küste liefert der kalte Pazifik eine außergewöhnliche Vielfalt. Dies sind die Arten, die wir produzieren."],"clientsEyebrow":"Kunden","clients":"Was unsere Kunden sagen","quotes":[["Produzieren Sie weiter in dieser Qualität — Ihr Produkt erfüllt alle unsere Erwartungen","Nam Cho","China"],["Qualitätsprodukte und großartige Partner, für immer","Joon Yang","Südkorea"],["Gute Freunde von mir, einzigartiges Produkt und echte Qualität","José Luis Martínez","Spanien"],["Beste Qualität, wir arbeiten gern zusammen","Kim Moon","Philippinen"]],"plant":["Unser Werk","In San Antonio, Region Valparaíso, mit über 1.350 m² bebauter Fläche und Gefrier- und Kühltechnik auf neuestem Stand.","Es ist auf Prozessgeschwindigkeit ausgelegt, mit Arbeitsschritten durch Personal, das auf die jeweiligen Zuschnitte spezialisiert ist, um das von jedem Kunden geforderte Endprodukt zu erreichen."],"plantRows":["Bebaute Fläche","Gefrierkapazität","Standort"],"team":["Unser Team","Wir wollen dem Kunden die beste Qualität liefern. Service-Exzellenz, ein Werk mit aktueller Technik und ein qualifiziertes Team haben uns über Jahre und über die Welt hinweg belastbare Beziehungen aufbauen lassen."],"roles":["Director Manager","General Manager","General Finance","Chief Operations"],"contact":["Kontakt","Nennen Sie uns Art, Format und Volumen. Wir antworten mit Verfügbarkeit und Preis."],"contactRows":["Adresse","E-Mail","Telefon"],"foot":"Alle Rechte vorbehalten.","captions":["Schwarzer Seehecht im Verarbeitungsraum","Anlieferung auf Eis","Verarbeitungsraum","Zuschnitt und Qualitätskontrolle","Container beladen zur Verschiffung"],"dragHint":"Ziehen","chain":["AUS DEM OZEAN","INS WERK","ZUM ZUSCHNITT","IN DIE WELT"],"askLabel":"Anfragen","mailSubject":"Anfrage: {s}","mailBody":"Guten Tag, ich interessiere mich für {s}. Könnten Sie mir Verfügbarkeit, Formate und Preis nennen?\n\nGeschätzte Menge:\nBestimmungsort:\n\nVielen Dank.","mailGeneral":"Handelsanfrage"},"zh-CN":{"eyebrow":"海产品出口","scroll":"向下滚动","cta":"联系我们","nav":["关于我们","产品","工厂","团队","联系"],"claims":["品质产品","海产品专家","可持续与手工渔业","客户的满意是我们的目标"],"about":["从南太平洋走向世界","公司源于 Luis Bonilla C. 在渔业的从业经验。在行业深耕二十年后，他决定直接对接终端客户。这段积累与智利供应商的信任，最先体现在鱿鱼生产上，随后形成了一支推动公司国际化的团队。","智利海岸与太平洋的冰冷水域，赋予我们独一无二的产品品质。"],"statLabels":["国家","销售点","经营年数"],"products":["我们的产品","在智利 6,435 公里的海岸线上，冰冷的太平洋孕育了极为丰富的物种。以下是我们生产的品种。"],"clientsEyebrow":"客户","clients":"客户评价","quotes":[["请继续保持这样的品质，你们的产品完全符合我们的期望","Nam Cho","中国"],["优质的产品与长久的伙伴关系","Joon Yang","韩国"],["我的好朋友，产品独特且品质出众","José Luis Martínez","西班牙"],["最好的品质，很高兴与你们合作","Kim Moon","菲律宾"]],"plant":["我们的工厂","位于瓦尔帕莱索大区圣安东尼奥，建筑面积超过 1,350 平方米，配备最新一代冷冻与冷藏设备。","工厂按照加工效率设计，各道工序由专精不同分切的人员负责，以产出每位客户所需的成品。"],"plantRows":["建筑面积","冷冻能力","位置"],"team":["我们的团队","我们致力于为客户提供最好的品质。优质的服务、先进的工厂设备与专业的团队，使我们得以在时间与地域上建立长期的信任关系。"],"roles":["董事总经理","总经理","财务总监","运营总监"],"contact":["联系我们","请告知物种、规格与数量，我们将回复库存与报价。"],"contactRows":["地址","邮箱","电话"],"foot":"版权所有。","captions":["加工车间内的智利海鲈","冰鲜收货","加工车间","分切与质量控制","装载完毕待发运的集装箱"],"dragHint":"拖动","chain":["来自海洋","进入工厂","完成分切","走向世界"],"askLabel":"询价","mailSubject":"询价：{s}","mailBody":"您好，我们对 {s} 有兴趣。能否提供库存、规格与报价？\n\n预计数量：\n目的地：\n\n谢谢。","mailGeneral":"商务询价"},"zh-TW":{"eyebrow":"海產品出口","scroll":"向下捲動","cta":"聯絡我們","nav":["關於我們","產品","工廠","團隊","聯絡"],"claims":["品質產品","海產品專家","永續與手工漁業","客戶的滿意是我們的目標"],"about":["從南太平洋走向世界","公司源於 Luis Bonilla C. 在漁業的從業經驗。在業界深耕二十年後，他決定直接對接終端客戶。這段累積與智利供應商的信任，最先體現在魷魚生產上，隨後形成了一支推動公司國際化的團隊。","智利海岸與太平洋的冰冷水域，賦予我們獨一無二的產品品質。"],"statLabels":["國家","銷售點","經營年數"],"products":["我們的產品","在智利 6,435 公里的海岸線上，冰冷的太平洋孕育了極為豐富的物種。以下是我們生產的品項。"],"clientsEyebrow":"客戶","clients":"客戶評價","quotes":[["請繼續保持這樣的品質，你們的產品完全符合我們的期望","Nam Cho","中國"],["優質的產品與長久的夥伴關係","Joon Yang","韓國"],["我的好朋友，產品獨特且品質出眾","José Luis Martínez","西班牙"],["最好的品質，很高興與你們合作","Kim Moon","菲律賓"]],"plant":["我們的工廠","位於瓦爾帕萊索大區聖安東尼奧，建築面積超過 1,350 平方公尺，配備最新一代冷凍與冷藏設備。","工廠依加工效率設計，各道工序由專精不同分切的人員負責，以產出每位客戶所需的成品。"],"plantRows":["建築面積","冷凍能力","位置"],"team":["我們的團隊","我們致力於為客戶提供最好的品質。優質的服務、先進的廠房設備與專業的團隊，使我們得以在時間與地域上建立長期的信任關係。"],"roles":["董事總經理","總經理","財務總監","營運總監"],"contact":["聯絡我們","請告知物種、規格與數量，我們將回覆庫存與報價。"],"contactRows":["地址","電子郵件","電話"],"foot":"版權所有。","captions":["加工車間內的智利海鱸","冰鮮收貨","加工車間","分切與品質管制","裝載完畢待發運的貨櫃"],"dragHint":"拖曳","chain":["來自海洋","進入工廠","完成分切","走向世界"],"askLabel":"詢價","mailSubject":"詢價：{s}","mailBody":"您好，我們對 {s} 有興趣。能否提供庫存、規格與報價？\n\n預計數量：\n目的地：\n\n謝謝。","mailGeneral":"商務詢價"},"ja":{"eyebrow":"水産物の輸出","scroll":"スクロール","cta":"お問い合わせ","nav":["会社概要","製品","工場","チーム","お問い合わせ"],"claims":["品質のある製品","水産物のエキスパート","持続可能な沿岸漁業","お客様のご満足が私たちの目標です"],"about":["南太平洋から世界へ","当社は Luis Bonilla C. の漁業での経験から生まれました。業界で二十年を過ごしたのち、最終顧客へ直接届けることを決意します。その実績とチリ国内サプライヤーからの信頼は、まずイカの生産に表れ、やがて会社を国際化するチームへとつながりました。","チリの海岸と太平洋の冷たい海が、他にはない品質の製品をもたらします。"],"statLabels":["取引国","販売拠点","操業年数"],"products":["製品ラインナップ","チリの海岸線 6,435 km に沿って、冷たい太平洋が類まれな多様性を育みます。当社が生産する魚種は以下のとおりです。"],"clientsEyebrow":"お客様","clients":"お客様の声","quotes":[["この品質を続けてください。御社の製品は当社の期待をすべて満たしています","Nam Cho","中国"],["高品質な製品と、末永いパートナーシップを","Joon Yang","韓国"],["私の大切な友人です。独自性と品質を兼ね備えた製品です","José Luis Martínez","スペイン"],["最高の品質です。ご一緒できて嬉しく思います","Kim Moon","フィリピン"]],"plant":["当社の工場","バルパライソ州サンアントニオに所在し、延床面積 1,350 m² 以上、最新世代の冷凍・冷蔵設備を備えています。","工程速度を重視した設計で、各カットに専従する担当者が単位作業を行い、お客様ごとに求められる最終製品に仕上げます。"],"plantRows":["延床面積","冷凍能力","所在地"],"team":["私たちのチーム","お客様に最高の品質をお届けすることを目指しています。サービスの質、最新設備の工場、そして専門性の高いチームが、長年にわたり世界各地との信頼関係を築いてきました。"],"roles":["ディレクターマネージャー","ゼネラルマネージャー","財務責任者","オペレーション責任者"],"contact":["お問い合わせ","魚種・規格・数量をお知らせください。在庫と価格をご返信します。"],"contactRows":["住所","メール","電話"],"foot":"無断転載を禁じます。","captions":["加工室のメロ（銀ムツ）","氷詰めでの受入","加工室","カットと品質管理","船積み用に積み込まれたコンテナ"],"dragHint":"ドラッグ","chain":["海から","工場へ","加工へ","世界へ"],"askLabel":"問い合わせ","mailSubject":"お問い合わせ：{s}","mailBody":"はじめまして。{s} に関心があります。在庫、規格、価格をお知らせいただけますでしょうか。\n\n希望数量：\n仕向地：\n\nよろしくお願いいたします。","mailGeneral":"商談のお問い合わせ"},"ko":{"eyebrow":"수산물 수출","scroll":"스크롤","cta":"문의하기","nav":["회사 소개","제품","공장","팀","문의"],"claims":["품질 있는 제품","수산물 전문가","지속 가능한 연안 어업","고객의 만족이 우리의 목표입니다"],"about":["남태평양에서 세계로","저희는 Luis Bonilla C. 의 어업 경험에서 출발했습니다. 업계에서 이십 년을 보낸 뒤 최종 고객에게 직접 다가가기로 결정했습니다. 그 경력과 칠레 공급업체들의 신뢰는 먼저 오징어 생산에서 드러났고, 이후 회사를 국제화하는 팀으로 이어졌습니다.","칠레 해안과 태평양의 차가운 바다가 다른 곳에 없는 품질의 제품을 제공합니다."],"statLabels":["교역 국가","판매 거점","업력"],"products":["제품 라인업","칠레 해안선 6,435 km 를 따라 차가운 태평양이 뛰어난 다양성을 길러냅니다. 저희가 생산하는 어종은 다음과 같습니다."],"clientsEyebrow":"고객","clients":"고객의 평가","quotes":[["이 품질을 계속 유지해 주십시오. 귀사의 제품은 저희 기대를 모두 충족합니다","Nam Cho","중국"],["좋은 품질의 제품과 오래가는 파트너십","Joon Yang","대한민국"],["저의 소중한 친구들이며, 독특하고 품질 좋은 제품입니다","José Luis Martínez","스페인"],["최고의 품질입니다. 함께 일하게 되어 기쁩니다","Kim Moon","필리핀"]],"plant":["저희 공장","발파라이소주 산안토니오에 위치하며, 연면적 1,350 m² 이상에 최신 세대의 냉동·냉장 설비를 갖추고 있습니다.","공정 속도를 고려해 설계되었으며, 각 절단 공정에 전문화된 인력이 단위 작업을 수행하여 고객이 요구하는 최종 제품을 만듭니다."],"plantRows":["연면적","냉동 능력","위치"],"team":["저희 팀","고객에게 최고의 품질을 전하는 것을 목표로 합니다. 서비스의 우수성, 최신 기술의 공장, 자격을 갖춘 전문 인력이 오랜 기간 전 세계와 신뢰 관계를 쌓아 왔습니다."],"roles":["디렉터 매니저","제너럴 매니저","재무 총괄","운영 총괄"],"contact":["문의","어종, 규격, 물량을 알려주시면 재고와 가격을 회신드립니다."],"contactRows":["주소","이메일","전화"],"foot":"모든 권리 보유.","captions":["가공실의 메로(비막치어)","얼음 입고","가공실","절단 및 품질 관리","선적을 위해 적재된 컨테이너"],"dragHint":"드래그","chain":["바다에서","공장으로","가공으로","세계로"],"askLabel":"문의","mailSubject":"문의: {s}","mailBody":"안녕하세요. {s} 에 관심이 있습니다. 재고, 규격, 가격을 알려주시겠습니까?\n\n예상 물량:\n목적지:\n\n감사합니다.","mailGeneral":"상담 문의"}},LABEL={"es":"ES","en":"EN","fr":"FR","pt":"PT","it":"IT","de":"DE","zh-CN":"中文","zh-TW":"繁中","ja":"日本語","ko":"한국어"},ORDER=["es","en","fr","pt","it","de","zh-CN","zh-TW","ja","ko"],FACTS={"stats": [14, 340, 7], "area": "1.350 m²", "capacity": "50 t / 24 h", "city": "San Antonio, Chile", "address": "Av. Bernardo O'Higgins 2929, San Antonio, Valparaíso, Chile", "email": "mbonilla@valrey.cl", "phone": "+56 9 7637 9609", "team": ["Luis Bonilla Castro", "Matias Bonilla Reyes", "Camila Bonilla Reyes", "Mauricio Valdebenito"]};
var STORE="insidus-language",
REDUCE=window.matchMedia("(prefers-reduced-motion: reduce)").matches,
revealObs=null,countObs=null;
function pick(){
try{var s=localStorage.getItem(STORE);if(s&&I18N[s])return s;}catch(e){}
try{
var n=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||"es"];
for(var i=0;i<n.length;i++){
var t=String(n[i]).toLowerCase();
if(t.indexOf("zh-tw")===0||t.indexOf("zh-hant")===0)return "zh-TW";
if(t.indexOf("zh")===0)return "zh-CN";
var b=t.split("-")[0];if(I18N[b])return b;
}
}catch(e){}
return "es";
}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n;}
function set(id,x){var n=document.getElementById(id);if(n)n.textContent=x;}
function clr(id){var n=document.getElementById(id);if(n)n.textContent="";return n;}
function clamp(v){return v<0?0:v>1?1:v;}
var BEAT_SHOT=["hero","hielo","proceso","corte","embarque"],
BEAT_CAP =[0,1,2,3,4];
for(var i=0;i<5;i++)document.getElementById("b"+i+"-img").src=SHOTS[BEAT_SHOT[i]];
document.getElementById("a-img").src=SHOTS.hielo;
document.getElementById("k-img").src=SHOTS.embarque;
function mailto(d,s){
return "mailto:"+FACTS.email+
"?subject="+encodeURIComponent(d.mailSubject.replace("{s}",s.es)+" — "+s.bino)+
"&body="+encodeURIComponent(d.mailBody.replace("{s}",s.es+" ("+s.trade+", "+s.bino+")"));
}
var timer=null;
function claims(list){
var n=document.getElementById("b0-claim"),i=0;
n.textContent=list[0];
if(timer){clearInterval(timer);timer=null;}
if(REDUCE)return;
timer=setInterval(function(){
n.classList.add("is-out");
setTimeout(function(){i=(i+1)%list.length;n.textContent=list[i];n.classList.remove("is-out");},480);
},4200);
}
var CUR=null;
function draw(code){
var d=I18N[code]||I18N.es;CUR=d;
document.documentElement.lang=code;
var nav=clr("nav");
[["#nosotros",0],["#productos",1],["#planta",2],["#equipo",3],["#contacto",4]].forEach(function(p){
var li=el("li"),a=el("a",null,d.nav[p[1]]);a.href=p[0];li.appendChild(a);nav.appendChild(li);
});
set("b0-kicker",d.eyebrow);set("b0-cta",d.cta);set("nav-cta",d.cta);
var nc=document.getElementById("nav-cta");
if(nc)nc.href="mailto:"+FACTS.email+"?subject="+encodeURIComponent(d.mailGeneral);
document.getElementById("b0-cta").href="mailto:"+FACTS.email+
"?subject="+encodeURIComponent(d.mailGeneral);
claims(d.claims);
for(var i=1;i<5;i++)set("b"+i+"-word",d.chain[i-1]);
set("intro-cue",d.scroll);
for(var j=0;j<5;j++)document.getElementById("b"+j+"-img").alt=d.captions[BEAT_CAP[j]];
set("a-kicker",d.nav[0]);set("a-title",d.about[0]);set("a-body",d.about[1]);
set("a-pull","“"+d.about[2]+"”");set("a-cap",d.captions[1]);
document.getElementById("a-img").alt=d.captions[1];
var fg=clr("a-figs");
FACTS.stats.forEach(function(v,i){
var b=el("div","fig"),n=el("div","fig__n",String(v));
n.setAttribute("data-count",String(v));
b.appendChild(n);b.appendChild(el("div","fig__l",d.statLabels[i]));fg.appendChild(b);
});
set("p-kicker",d.nav[1]);set("p-title",d.products[0]);set("p-lead",d.products[1]);
set("p-hint",d.dragHint);
var st=clr("p-strip");
SPECIES.forEach(function(s,i){
var c=el("article","sp");
c.appendChild(el("div","sp__ix",String(i+1).padStart(2,"0")+" / "+String(SPECIES.length).padStart(2,"0")));
var fr=el("div","sp__frame"),im=el("img","sp__img");
im.src=PHOTOS[s.id];im.alt=s.es;im.loading="lazy";im.draggable=false;
fr.appendChild(im);c.appendChild(fr);
var b=el("div");
b.appendChild(el("h3","sp__name",s.es));
b.appendChild(el("p","sp__trade",s.trade));
b.appendChild(el("p","sp__bino",s.bino));
var ask=el("a","sp__ask");ask.href=mailto(d,s);
ask.appendChild(el("span",null,d.askLabel));ask.appendChild(el("b",null,"→"));
b.appendChild(ask);c.appendChild(b);st.appendChild(c);
});
set("t-kicker",d.clientsEyebrow);set("t-title",d.clients);
var q=clr("t-list");
d.quotes.forEach(function(x){
var b=el("div","qt");
b.appendChild(el("p","qt__t","“"+x[0]+"”"));
b.appendChild(el("p","qt__a",x[1]+" · "+x[2]));q.appendChild(b);
});
set("l-kicker",d.nav[2]);set("l-title",d.plant[0]);
set("l-body1",d.plant[1]);set("l-body2",d.plant[2]);
var du=clr("l-duo");
[[SHOTS.proceso,d.captions[2]],[SHOTS.corte,d.captions[3]]].forEach(function(p){
var f=el("figure"),im=el("img");im.src=p[0];im.alt=p[1];im.loading="lazy";
f.appendChild(im);f.appendChild(el("figcaption",null,p[1]));du.appendChild(f);
});
var lr=clr("l-rows");
[[d.plantRows[0],FACTS.area],[d.plantRows[1],FACTS.capacity],[d.plantRows[2],FACTS.city]]
.forEach(function(r){
var row=el("div","row");row.appendChild(el("span","row__k",r[0]));
row.appendChild(el("span","row__v",r[1]));lr.appendChild(row);
});
set("e-kicker",d.nav[3]);set("e-title",d.team[0]);set("e-lead",d.team[1]);
var tl=clr("e-list");
FACTS.team.forEach(function(p,i){
var b=el("div","person");
b.appendChild(el("div","person__ini",p.split(" ").slice(0,2).map(function(w){return w[0];}).join("")));
b.appendChild(el("p","person__n",p));
b.appendChild(el("p","person__r",d.roles[i]));tl.appendChild(b);
});
set("k-kicker",d.nav[4]);set("k-title",d.contact[0]);set("k-lead",d.contact[1]);
set("k-cap",d.captions[4]);document.getElementById("k-img").alt=d.captions[4];
var kr=clr("k-rows");
var vals=[FACTS.address,FACTS.email,FACTS.phone],
hrefs=[null,"mailto:"+FACTS.email,"tel:"+FACTS.phone.replace(/\s/g,"")];
d.contactRows.forEach(function(k,i){
var row=el("div","row");row.appendChild(el("span","row__k",k));
var v=el("span","row__v");
if(hrefs[i]){var a=el("a",null,vals[i]);a.href=hrefs[i];v.appendChild(a);}
else v.textContent=vals[i];
row.appendChild(v);kr.appendChild(row);
});
set("f-note","© "+new Date().getFullYear()+" INSIDUS SpA · "+d.foot);
markReveals();
}
var sel=document.getElementById("lang");
ORDER.forEach(function(c){var o=el("option",null,LABEL[c]);o.value=c;sel.appendChild(o);});
var start=pick();sel.value=start;draw(start);
sel.addEventListener("change",function(){
var v=sel.value;try{localStorage.setItem(STORE,v);}catch(e){}draw(v);sel.value=v;
});
var beats=[].slice.call(document.querySelectorAll(".beat")),
intro=document.getElementById("intro"),
stage=document.querySelector(".intro__stage"),
ticksHost=document.getElementById("ticks"),
cue=document.getElementById("intro-cue"),
cap=document.getElementById("intro-cap"),
bar=document.getElementById("bar"),
ticks=[];
for(var t=0;t<beats.length;t++){var b=el("span","tick");ticksHost.appendChild(b);ticks.push(b);}
if(REDUCE){
intro.style.height="100vh";
beats[0].style.opacity=1;
beats[0].querySelector(".beat__img").style.transform="none";
ticks[0].classList.add("is-on");
}
var N=beats.length,queued=false;
function paint(){
queued=false;
var r=intro.getBoundingClientRect(),
span=intro.offsetHeight-window.innerHeight,
p=span>0?clamp(-r.top/span):0;
if(!REDUCE){
var seg=1/N,active=0,best=-1;
for(var i=0;i<N;i++){
var c=(i+0.5)*seg,
dist=Math.abs(p-c)/seg,
o=clamp(1-(dist-0.30)/0.55),
rel=(p-c)/seg;
beats[i].style.opacity=o;
beats[i].querySelector(".beat__img").style.transform="scale("+(1.10-rel*0.035).toFixed(4)+")";
var w=beats[i].querySelector(".beat__word");
if(w)w.style.transform="translateY("+(rel*-34).toFixed(1)+"px)";
if(o>best){best=o;active=i;}
}
for(var k=0;k<N;k++)ticks[k].classList.toggle("is-on",k===active);
if(CUR)cap.textContent=CUR.captions[BEAT_CAP[active]];
cue.style.opacity=p<0.04?1:0;
}
bar.classList.toggle("is-solid",r.bottom<=window.innerHeight*0.85);
}
function onScroll(){if(!queued){queued=true;requestAnimationFrame(paint);}}
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",onScroll);
paint();
function markReveals(){
if(REDUCE)return;
if(!revealObs&&"IntersectionObserver" in window){
revealObs=new IntersectionObserver(function(es){
es.forEach(function(e){
if(e.isIntersecting){e.target.classList.add("is-in");revealObs.unobserve(e.target);}
});
},{rootMargin:"0px 0px -12% 0px"});
}
if(!countObs&&"IntersectionObserver" in window){
countObs=new IntersectionObserver(function(es){
es.forEach(function(e){
if(!e.isIntersecting)return;
countObs.unobserve(e.target);
var to=+e.target.getAttribute("data-count"),t0=null;
function step(ts){
if(t0===null)t0=ts;
var k=clamp((ts-t0)/900),eased=1-Math.pow(1-k,3);
e.target.textContent=String(Math.round(to*eased));
if(k<1)requestAnimationFrame(step);
}
requestAnimationFrame(step);
});
},{rootMargin:"0px 0px -18% 0px"});
}
if(!revealObs)return;
var q=".band .kicker,.band .h2,.band .lead,.band .pull,.band .shot,"+
".figs,.strip,.quotes,.duo,.team,.rows";
Array.prototype.forEach.call(document.querySelectorAll(q),function(n){
if(n.classList.contains("js-reveal"))return;
n.classList.add("js-reveal");revealObs.observe(n);
});
Array.prototype.forEach.call(document.querySelectorAll("[data-count]"),function(n){
countObs.observe(n);
});
}
(function(){
var s=document.getElementById("p-strip"),down=false,x0=0,l0=0,moved=0;
s.addEventListener("pointerdown",function(e){
if(e.pointerType==="touch")return;
down=true;moved=0;x0=e.clientX;l0=s.scrollLeft;s.classList.add("is-drag");
s.setPointerCapture(e.pointerId);
});
s.addEventListener("pointermove",function(e){
if(!down)return;var dx=e.clientX-x0;moved=Math.max(moved,Math.abs(dx));s.scrollLeft=l0-dx;
});
function up(e){if(!down)return;down=false;s.classList.remove("is-drag");
try{s.releasePointerCapture(e.pointerId);}catch(_){}}
s.addEventListener("pointerup",up);s.addEventListener("pointercancel",up);
s.addEventListener("click",function(e){if(moved>6)e.preventDefault();},true);
})();
var navObs=new IntersectionObserver(function(es){
es.forEach(function(e){
if(!e.isIntersecting)return;
var id="#"+e.target.id;
Array.prototype.forEach.call(document.querySelectorAll("#nav a"),function(a){
a.setAttribute("aria-current",a.getAttribute("href")===id?"true":"false");
});
});
},{rootMargin:"-45% 0px -50% 0px"});
["nosotros","productos","planta","equipo","contacto"].forEach(function(id){
var n=document.getElementById(id);if(n)navObs.observe(n);
});
})();