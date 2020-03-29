# ReCOVer: COVID-19 Vulnerability Tracker
## Mission Statement
 
The 2019 novel coronavirus disease (COVID-19) was declared a pandemic by the World Health Organization (WHO) on March 11th, 2020<sup>1</sup>, and now surpasses 500,000 cases across 200 countries<sup>2</sup>. While the events of this outbreak are still unfolding, this unprecedented event has already devastated many communities, resulting in loss of life, depletion of healthcare resources, and economic instability.
 
The ability of a community to prevent and minimize harm and financial loss in the face of disaster is typically linked to its social conditions. Vulnerable communities with poorer social indicators are often less prepared for disaster, and less likely to fully recover<sup>3</sup>. Effectively identifying and addressing these disparities is crucial to address health inequities and ensure community resilience to new health risks.
 
Vulnerability indices summarize social and spatially relevant information, and are often used by public health officials, planners, and policymakers to respond to emergency events, such as natural disasters, anthropogenic events, or disease outbreak. The Centers for Disease Control’s Social Vulnerability Index (SVI) compiles dimensions such as socioeconomic status and household composition to help identify vulnerable communities that need support before, during, and after a hazardous event<sup>3</sup>. Locally, Public Health Ontario’s Ontario Marginalization Index (ON-Marg) also measures multiple indicators of deprivation, based on dimensions of residential instability, dependency, and ethnic concentration<sup>4</sup>.
 
While these indices provide substantial value towards identifying vulnerable populations, in the context of the COVID-19 crisis, social vulnerability indicators alone may not paint the whole picture. We are observing early on that COVID-19 disproportionately affects the senior population<sup>5</sup>, and as a communicable disease, is more likely to affect densely populated areas. As such, our goal was to develop a COVID-19-specific index, to identify susceptible populations and evaluate the vulnerability of Toronto neighbourhoods in response to the COVID-19 outbreak.
 
 
## App description and features
 
Our app, *ReCOVer*, aims to help Toronto’s public health officials, emergency response staff, and residents identify neighbourhoods where vulnerable populations are located, and examine how resilient these communities might be in response to the COVID-19 outbreak. First, users will be able to calculate a COVID-19 Neighbourhood Vulnerability Index for their neighbourhood, and will be able to view key demographic numbers and healthcare facilities in their area. Second, users are able to search locations and identify nearby healthcare facilities within a defined radius.

### Functionalities
#### Compare neighbourhoods
This feature allows you to compare the CNVI between neighbourhoods, to help distinguish which areas may be more or less vulnerable.
You will also be able to compare each dimension of the CNVI, to view which aspect of each neighbourhood makes them more or less vulnerable.
#### Locate nearby hospitals
This feature lets you search for nearby hospitals based on a user-defined location. 
You are able to view the list of hospitals, get directions, and query COVID-19 Testing Centres. 
#### At a glance
This feature provides a snapshot of the population characteristics and indices in the current map extent.
As you pan through the map, you will be able to see a summary of the mean CNVI in the area, and relevant statistics about its vulnerable population.
#### Summary Report
This feature allows you to summarize the vulnerability and population characteristics within a user-defined area. 
The place name option allows you to create a buffer around a specific location to generate a summary report of the vulnerability in that area.
The draw option allows you to generate a summary report within a user-drawn area. 



 
## Calculations
### COVID-19 Neighbourhood Vulnerability Index (CNVI)
 
The **CNVI** consists of neighbourhood-level variables that account for vulnerable populations, probability of exposure, and preparedness of healthcare facilities. Together, these factors indicate which neighbourhoods may be more susceptible to exposure or less capable of dealing with crisis. There are 5 dimensions of the CNVI: socioeconomic status, vulnerable seniors, healthcare usage, chronic disease, and exposure. For each dimension, an equally weighted index was calculated from normalized rates of various neighbourhood-level variables, displayed on a scale from 0-10, where higher values are worse. The CNVI is the average of indices from each dimension, and was normalized to show variation across neighbourhoods.
 
**Socioeconomic status (SES):** Social and economic characteristics are often linked to health outcomes and ability to respond to adverse events. This dimension encapsulates basic dimensions of SES status: education, market-based measure income<sup>6</sup>, ethnic concentration, and primary language. The following rates were calculated, normalized, and converted into an equally weighted index:
 
`SES Index (SESI) = 2.5 x UnivGrad + 2.5 x LowIncome + 2.5 x Minority + 2.5 x NoEnFr`
 
    UnivGrad = 1 – (rate of people with a university degree at bachelor level or above)
    LowIncome = rate of low-income individuals based on the market-based measure
    Minority = rate of visible minorities for the population in private households
    NoEnFr = rate of mother tongue that is not English or French for total population

 
**Vulnerable seniors:** Current studies show that morbidity and mortality rates for COVID-19 is higher amongst seniors <sup> 6 </sup>. As such, this dimension accounts for the population seniors (> 65) within each neighbourhood, seniors living alone, and the number of senior facilities in each neighbourhood.
 
`Vulnerable Senior Index (VSI) = 3.33 x SeniorPop + 3.33 x SenAlone + 3.33 x SeniorFacilities`
 
    SeniorPop = per capita rate of persons aged > 65
    SenAlone = rate of people aged >65 living alone amongst private household population
    SenFacilities = number of long term care facilities, retirement homes, and senior active living centres per neighbourhood
 
 
**Neighbourhood Health (NH):** Prevalence of chronic health conditions are an indicator of neighbourhood-level health, and in the context of COVID-19, the vulnerable population also includes those with underlying chronic health conditions.  This dimension accounts for the prevalence of chronic respiratory diseases, COPD and asthma, along with diabetes and hypertension, among adults.
 
`NH Index (NHI) = 2.5 x Asthma + 2.5 x COPD + 2.5 x Diab + 2.5 x HBP`
 
    Asthma = age-standardized rate of asthma, all ages
    COPD = age-standardized rate of COPD, ages +35
    Diab = age-standardized rate of diabetes, ages +20
    HBP = age-standardized rate of high blood pressure, ages +20
 
**Healthcare preparedness:** This dimension encapsulates the degree of healthcare resource utilization within each neighbourhood. This provides insight into the potential strain of healthcare resources that may be experienced in a community in the case of a communicable disease outbreak. This dimension reports annual hospitalization rates, ED visits, and proportion of Family Healthcare Team (FHT) or Community Healthcare Centre (CHC) patients<sup>7,8</sup>.
 
`Healthcare Preparedness Index (HPI) = 3.33 x HospRate + 3.33 x EDRate + 0.33 x FHTCHC`
 
    HospRate = age-standardized average annual rate of all hospitalizations, all ages
    EDRate = age-standardized average annual rate of all ED visits, all ages               
    FHTCHC = 1 - (per capita rate of FHT or CHC patients, among registered persons database population)
 
 
**Exposure and behaviours:** This dimension identifies the population that is at high risk of exposure to the spread of communicable diseases, either through their living conditions or their behaviours. This includes people who may commute or walk to work, live in crowded areas, or live in high-density neighbourhoods.
 
`Exposure Index (EI) = 2.5 x Crowding + 2.5 x Apartm + 2.5 x TransWalk + 2.5 x Density`
 
    Crowding = rate of private households with more than 1 person per room
    Apartm = rate of occupied private dwellings in an apartment building with 5+ storeys
    TransWalk = rate of commuters who walk or take transit to work, among employed labour force >15
 
The **CNVI** is thus the weighted average of each index: 

`CNVI = 2 x SESI + 2 x VSI + 2 x NHI + 2 x HPI + 2 x EI`

*The imPACt app displays a normalized value of CNVI to emphasize variation across neighbourhoods, however the individual indices are displayed as their raw scores.*

## Data Sources
### Census and health data
Ontario Health Profiles (2016/7): http://www.ontariohealthprofiles.ca/dataTablesON.php?varTab=HPDtbl&select1=7

Toronto neighbourhoods profile: 
https://open.toronto.ca/dataset/neighbourhood-profiles/  
 
### Spatial data
Toronto Neighbourhoods: https://open.toronto.ca/dataset/neighbourhoods/

Ontario Hospitals: https://geohub.lio.gov.on.ca/datasets/ministry-of-health-service-provider-locations
 
## References
 
1. WHO Director-General’s opening remarks at the media briefing on COVID-19. (2020, March 11). World Health Organization. https://www.who.int/dg/speeches/detail/who-director-general-s-opening-remarks-at-the-media-briefing-on-covid-19---11-march-2020
2. World Health Organization. (2020). COVID-19 Situation Report (No. 67). World Health Organization. https://www.who.int/docs/default-source/coronaviruse/situation-reports/20200327-sitrep-67-covid-19.pdf?sfvrsn=b65f68eb_4
3. Agency for Toxic Substances and Disease Registry (ATSDR), (2018, September 10). The Social Vulnerability Index (SVI): Fact Sheet. Centers for Disease Control and Prevention.
4. Ontario Marginalization Index (ON-Marg). (n.d.). Public Health Ontario. Retrieved March 28, 2020, from https://www.publichealthontario.ca/en/Data and Analysis/Health Equity/Ontario Marginalization Index
5. Wu, C., Chen, X., Cai, Y., Xia, J., Zhou, X., Xu, S., Huang, H., Zhang, L., Zhou, X., Du, C., Zhang, Y., Song, J., Wang, S., Chao, Y., Yang, Z., Xu, J., Zhou, X., Chen, D., Xiong, W., et al. (2020). Risk Factors Associated With Acute Respiratory Distress Syndrome and Death in Patients With Coronavirus Disease 2019 Pneumonia in Wuhan, China. JAMA Internal Medicine. https://doi.org/10.1001/jamainternmed.2020.0994
6. Government of Canada, S. C. (2017, May 3). Dictionary, Census of Population, 2016—Market Basket Measure (MBM). https://www12.statcan.gc.ca/census-recensement/2016/ref/dict/pop165-eng.cfm
7. Government of Ontario, M. of H. and L.-T. C. (n.d.). Q&A: Understanding Family Health Teams. Government of Ontario, Ministry of Health and Long-Term Care. Retrieved March 28, 2020, from http://www.health.gov.on.ca/en/pro/programs/fht/fht_understanding.aspx
8. Government of Ontario, M. of H. and L.-T. C. (n.d.). Community Health Centres. Government of Ontario, Ministry of Health and Long-Term Care. Retrieved March 28, 2020, from http://www.health.gov.on.ca/en/common/system/services/chc/default.aspx
