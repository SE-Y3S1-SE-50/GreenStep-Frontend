import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = 320;

interface NavigationItem {
  id: string;
  title: string;
}

interface NavigationSection {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: NavigationItem[];
}

interface ContentData {
  title: string;
  content: string;
}

interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
  timestamp: number;
}

const EducationTab: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [chatbotOpen, setChatbotOpen] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<string>('what-is-reforestation');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      type: 'bot', 
      message: 'Hello! I\'m your **reforestation assistant**. I\'m here to guide you through environmental conservation and answer any questions you have about trees, planting, and sustainability. Let\'s explore together!',
      timestamp: Date.now()
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [typing, setTyping] = useState<boolean>(false);

  // Animation references
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const chatScaleAnim = useRef(new Animated.Value(0)).current;

  const navigationSections: NavigationSection[] = [
    {
      id: 'basics',
      title: 'Basics of Reforestation',
      icon: 'leaf-outline',
      items: [
        { id: 'what-is-reforestation', title: 'What is Reforestation?' },
        { id: 'importance-trees', title: 'Importance of Trees & Forests' },
        { id: 'environmental-benefits', title: 'Environmental Benefits' },
        { id: 'social-economic-benefits', title: 'Social & Economic Benefits' }
      ]
    },
    {
      id: 'species-planting',
      title: 'Tree Species & Planting',
      icon: 'book-outline',
      items: [
        { id: 'local-vs-native', title: 'Local vs. Non-native Species' },
        { id: 'planting-guidelines', title: 'Planting Guidelines & Tips' },
        { id: 'seasonal-calendar', title: 'Seasonal Planting Calendar' },
        { id: 'tree-identification', title: 'Tree Identification Guide' }
      ]
    },
    {
      id: 'reforestation-techniques',
      title: 'Reforestation Techniques',
      icon: 'people-outline',
      items: [
        { id: 'seeding-vs-saplings', title: 'Direct Seeding vs. Saplings' },
        { id: 'agroforestry', title: 'Agroforestry' },
        { id: 'community-reforestation', title: 'Community-based Reforestation' },
        { id: 'maintenance-monitoring', title: 'Maintenance & Monitoring' }
      ]
    },
    {
      id: 'environmental-awareness',
      title: 'Environmental Awareness',
      icon: 'bulb-outline',
      items: [
        { id: 'deforestation-causes', title: 'Deforestation Causes' },
        { id: 'climate-change', title: 'Climate Change & Forests' },
        { id: 'wildlife-conservation', title: 'Wildlife Conservation' },
        { id: 'case-studies', title: 'Case Studies / Success Stories' }
      ]
    },
    {
      id: 'educational-media',
      title: 'Educational Media',
      icon: 'document-text-outline',
      items: [
        { id: 'articles-blogs', title: 'Articles & Blogs' },
        { id: 'infographics-maps', title: 'Infographics & Maps' },
        { id: 'videos-tutorials', title: 'Videos & Tutorials' },
        { id: 'podcasts-interviews', title: 'Podcasts / Interviews' }
      ]
    },
    {
      id: 'activities-engagement',
      title: 'Activities & Engagement',
      icon: 'trophy-outline',
      items: [
        { id: 'quizzes-challenges', title: 'Quizzes & Challenges' },
        { id: 'volunteer-opportunities', title: 'Volunteer Opportunities' },
        { id: 'citizen-science', title: 'Citizen Science Projects' },
        { id: 'gamified-learning', title: 'Gamified Learning' }
      ]
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: 'bookmark-outline',
      items: [
        { id: 'ebooks-research', title: 'eBooks & Research Papers' },
        { id: 'external-organizations', title: 'External Organizations & Links' },
        { id: 'government-guidelines', title: 'Government Guidelines' },
        { id: 'community-forums', title: 'Community Forums / Discussion Boards' }
      ]
    }
  ];

  const contentData: Record<string, ContentData> = {
    'what-is-reforestation': {
      title: 'What is Reforestation?',
      content: `Reforestation is the process of replanting trees in areas where forests have been depleted, damaged, or destroyed. It involves establishing forest cover in previously forested areas that have been cleared due to deforestation, natural disasters, or other factors.

Key aspects of reforestation include:
• Restoring degraded forest ecosystems
• Planting native tree species suited to local conditions
• Creating sustainable forest management practices
• Involving local communities in conservation efforts

Reforestation differs from afforestation, which involves planting trees in areas that were not previously forested. Both practices are crucial for environmental restoration and climate change mitigation.

Benefits of Reforestation:
• Carbon sequestration to combat climate change
• Soil erosion prevention and watershed protection
• Habitat restoration for wildlife species
• Economic opportunities through sustainable forestry
• Improved air and water quality for communities`
    },
    'importance-trees': {
      title: 'Importance of Trees & Forests',
      content: `Trees and forests are fundamental to life on Earth, providing countless benefits to both the environment and human society.

Environmental Importance:
• Oxygen production through photosynthesis
• Carbon dioxide absorption and storage
• Air purification and pollution reduction
• Water cycle regulation and soil conservation
• Biodiversity habitat provision

Human Benefits:
• Timber and non-timber forest products
• Recreation and tourism opportunities
• Mental health and well-being benefits
• Natural cooling and temperature regulation
• Protection from natural disasters like floods and landslides

Ecosystem Services:
• Climate regulation at local and global scales
• Pollination services for agricultural crops
• Natural pest control through predator habitats
• Soil formation and nutrient cycling
• Cultural and spiritual significance for communities`
    },
    'environmental-benefits': {
      title: 'Environmental Benefits',
      content: `Reforestation provides numerous environmental benefits that are crucial for ecosystem health and climate stability.

Climate Benefits:
• Carbon sequestration - forests absorb and store atmospheric CO2
• Temperature regulation through evapotranspiration
• Microclimate stabilization in local areas
• Reduction of urban heat island effects

Water Cycle Benefits:
• Watershed protection and groundwater recharge
• Reduced surface runoff and flood prevention
• Water quality improvement through natural filtration
• Stream flow regulation during dry periods

Biodiversity Benefits:
• Habitat restoration for native species
• Wildlife corridor creation for animal migration
• Preservation of endangered plant and animal species
• Ecosystem connectivity and resilience building

Soil Benefits:
• Prevention of soil erosion through root systems
• Improvement of soil structure and fertility
• Enhancement of organic matter content
• Restoration of degraded agricultural lands`
    },
    'social-economic-benefits': {
      title: 'Social & Economic Benefits',
      content: `Reforestation creates significant social and economic value for communities and nations.

Economic Benefits:
• Job creation in forestry, nurseries, and related industries
• Sustainable timber and non-timber forest products
• Eco-tourism and recreational opportunities
• Carbon credit markets and environmental payments
• Reduced costs from natural disaster damage

Social Benefits:
• Improved public health through cleaner air and water
• Community engagement and environmental education
• Cultural preservation and traditional knowledge
• Enhanced quality of life and mental well-being
• Food security through agroforestry systems

Long-term Value:
• Increased property values near forested areas
• Reduced healthcare costs from improved air quality
• Climate resilience and adaptation benefits
• Sustainable resource base for future generations
• Enhanced national and regional competitiveness`
    },
    'local-vs-native': {
      title: 'Local vs. Non-native Species',
      content: `Choosing the right tree species is crucial for successful reforestation projects.

Native Species Advantages:
• Adapted to local climate and soil conditions
• Support local wildlife and ecosystem functions
• Require less maintenance and water
• Lower risk of becoming invasive
• Preserve genetic diversity and local ecosystems

Local Species Selection:
• Research historical vegetation of the area
• Consider climate change adaptation potential
• Evaluate growth rates and survival rates
• Assess wildlife habitat value
• Factor in human use and economic value

Non-native Species Considerations:
• May grow faster in certain conditions
• Can provide specific economic benefits
• Risk of becoming invasive and displacing natives
• May not support local wildlife effectively
• Could alter soil chemistry and ecosystem processes

Best Practices:
• Prioritize native species whenever possible
• Use local seed sources for genetic adaptation
• Mix species for ecosystem resilience
• Monitor long-term ecological impacts
• Involve local communities in species selection`
    },
    'planting-guidelines': {
      title: 'Planting Guidelines & Tips',
      content: `Proper planting techniques are essential for tree survival and healthy forest establishment.

Site Preparation:
• Remove invasive vegetation and competing plants
• Test soil pH, nutrients, and drainage
• Ensure adequate sunlight for target species
• Plan for water access during establishment
• Consider slope, aspect, and microclimate factors

Planting Techniques:
• Dig holes 2-3 times wider than root ball
• Plant at same depth as in nursery container
• Gently tease apart circling roots
• Water immediately after planting
• Apply 2-4 inch layer of organic mulch

Spacing Guidelines:
• Consider mature size of trees
• Allow for natural mortality (plant 10-20% extra)
• Create diverse age structure and species mix
• Leave space for natural regeneration
• Consider maintenance access needs

Post-Planting Care:
• Regular watering for first 1-2 years
• Weed control around young trees
• Protection from browsing animals
• Monitor for pests and diseases
• Prune only dead or damaged branches`
    },
    'seasonal-calendar': {
      title: 'Seasonal Planting Calendar',
      content: `Timing is crucial for successful tree planting and varies by region and species.

Spring Planting (March-May):
• Best time for most deciduous trees
• Soil is workable and warming up
• Trees have full growing season to establish
• Good moisture availability in most regions
• Avoid planting during late frost periods

Fall Planting (September-November):
• Excellent for evergreen species
• Cooler temperatures reduce transplant stress
• Root growth continues while shoots are dormant
• Natural rainfall helps with establishment
• Less competition from weeds

Summer Planting (June-August):
• Generally not recommended in hot climates
• Requires intensive watering and care
• Only plant if irrigation is guaranteed
• Choose early morning or late evening
• Use shade cloth to reduce stress

Winter Considerations:
• Avoid planting in frozen or waterlogged soil
• Container plants can be planted in mild weather
• Good time for planning and site preparation
• Order seedlings for spring planting
• Prepare tools and materials for next season

Regional Variations:
• Tropical areas: Plant before rainy season
• Temperate zones: Follow spring/fall guidelines
• Arid regions: Time with monsoon patterns
• Coastal areas: Consider salt spray seasons`
    },
    'tree-identification': {
      title: 'Tree Identification Guide',
      content: `Learning to identify trees is essential for reforestation planning and monitoring.

Key Identification Features:
• Leaf shape, size, arrangement, and margin
• Bark texture, color, and patterns
• Tree shape, size, and growth habit
• Flowers, fruits, seeds, and cones
• Habitat preferences and growing conditions

Leaf Characteristics:
• Simple vs. compound leaves
• Alternate, opposite, or whorled arrangement
• Smooth, toothed, or lobed margins
• Needle-like, scale-like, or broad leaves
• Deciduous vs. evergreen nature

Bark Identification:
• Smooth, furrowed, or plated bark
• Color variations from gray to reddish-brown
• Presence of thorns, spines, or markings
• Thickness and peeling patterns
• Age-related changes in bark appearance

Seasonal Changes:
• Spring: New leaf emergence and flowering
• Summer: Full foliage and fruit development
• Fall: Color changes and seed dispersal
• Winter: Bare branches and bud arrangement

Identification Tools:
• Field guides and mobile apps
• Hand lens for detailed examination
• Measuring tape for size assessment
• Camera for documentation
• GPS for location recording`
    },
    'seeding-vs-saplings': {
      title: 'Direct Seeding vs. Saplings',
      content: `Both methods have advantages and are suitable for different situations and objectives.

Direct Seeding Benefits:
• Lower cost per tree planted
• Natural root development without transplant shock
• Better adaptation to site conditions
• Large-scale planting efficiency
• Maintains genetic diversity

Direct Seeding Challenges:
• Higher mortality rates (30-70%)
• Slower initial establishment
• Vulnerable to weather extremes
• Competition from weeds and grasses
• Difficulty protecting from wildlife

Sapling Planting Benefits:
• Higher survival rates (70-90%)
• Faster initial growth and establishment
• Better control over spacing and location
• Easier to protect and maintain
• More predictable outcomes

Sapling Planting Challenges:
• Higher cost per tree
• Transplant shock potential
• Limited genetic diversity
• Labor-intensive planting process
• Transport and storage requirements

Site Considerations:
• Direct seeding better for remote or difficult terrain
• Saplings preferred for high-value or visible sites
• Soil moisture availability affects method choice
• Wildlife pressure may favor saplings
• Project timeline influences decision

Hybrid Approaches:
• Combination of methods for resilience
• Direct seeding with sapling infill
• Progressive planting over multiple years
• Adaptive management based on results`
    },
    'agroforestry': {
      title: 'Agroforestry',
      content: `Agroforestry integrates trees with agricultural crops and livestock for sustainable land use.

Agroforestry Systems:
• Alley cropping: Trees in rows with crops between
• Silvopasture: Trees integrated with livestock grazing
• Forest farming: Crops grown under forest canopy
• Windbreaks: Tree rows protecting crops from wind
• Riparian buffers: Trees along waterways

Benefits for Farmers:
• Diversified income streams from multiple products
• Reduced risk from crop failures or market fluctuations
• Improved soil fertility through leaf litter and nitrogen fixation
• Natural pest control and pollination services
• Enhanced water retention and microclimate regulation

Environmental Advantages:
• Carbon sequestration in trees and soil
• Reduced soil erosion and nutrient runoff
• Enhanced biodiversity on working lands
• Improved water quality and watershed protection
• Climate change adaptation and resilience

Economic Considerations:
• Initial investment in tree establishment
• Long-term returns from tree products
• Potential premium prices for sustainable products
• Reduced input costs for fertilizers and pesticides
• Value-added processing opportunities

Implementation Strategies:
• Start with small demonstration areas
• Choose appropriate tree species for local conditions
• Plan for long-term market development
• Provide technical assistance and training
• Support policy frameworks for adoption`
    },
    'community-reforestation': {
      title: 'Community-based Reforestation',
      content: `Community involvement is essential for successful and sustainable reforestation projects.

Community Engagement Benefits:
• Local knowledge of suitable species and sites
• Long-term stewardship and maintenance
• Economic opportunities for local residents
• Environmental education and awareness
• Cultural preservation and traditional practices

Planning Process:
• Conduct community consultations and needs assessments
• Identify local leaders and champions
• Develop shared vision and objectives
• Secure land tenure and use rights
• Create governance structures and agreements

Capacity Building:
• Training in nursery management and tree planting
• Leadership development and project management
• Financial literacy and enterprise development
• Technical skills in forest monitoring
• Environmental education programs

Incentive Systems:
• Direct payments for planting and maintenance
• Revenue sharing from forest products
• Carbon credit opportunities
• Microfinance and grant support
• Recognition and certification programs

Challenges and Solutions:
• Conflicting land uses and priorities
• Limited technical and financial resources
• Lack of immediate economic returns
• Weak institutional capacity
• Climate and environmental risks

Success Factors:
• Strong local leadership and ownership
• Clear benefit-sharing arrangements
• Technical support and training
• Adequate and sustained funding
• Monitoring and adaptive management`
    },
    'maintenance-monitoring': {
      title: 'Maintenance & Monitoring',
      content: `Ongoing care and monitoring ensure reforestation project success and sustainability.

Maintenance Activities:
• Regular watering during establishment (1-3 years)
• Weed control and vegetation management
• Pruning damaged or competing branches
• Pest and disease monitoring and treatment
• Protection from browsing animals

Monitoring Protocols:
• Survival rates and mortality causes
• Growth measurements (height, diameter)
• Species composition and diversity
• Soil health and water quality indicators
• Wildlife use and habitat development

Data Collection Methods:
• Permanent sample plots for long-term tracking
• Regular photo monitoring from fixed points
• GPS mapping of planted areas and natural regeneration
• Remote sensing and drone surveys
• Community-based monitoring programs

Adaptive Management:
• Adjust species composition based on performance
• Modify maintenance practices based on results
• Replace failed plantings in critical areas
• Expand successful techniques to new areas
• Respond to changing environmental conditions

Long-term Monitoring:
• Forest structure and composition changes
• Carbon storage and sequestration rates
• Biodiversity recovery and species return
• Water cycle and soil improvement
• Social and economic benefits assessment

Technology Integration:
• Mobile apps for field data collection
• Satellite imagery for landscape monitoring
• Sensors for environmental monitoring
• Database systems for data management
• GIS mapping for spatial analysis`
    },
    'deforestation-causes': {
      title: 'Deforestation Causes',
      content: `Understanding deforestation drivers is crucial for effective conservation and reforestation strategies.

Agricultural Expansion:
• Conversion for crop cultivation (palm oil, soy, cattle ranching)
• Slash-and-burn agriculture in tropical regions
• Commercial agriculture and monoculture plantations
• Small-scale subsistence farming pressure
• Land speculation and development

Logging and Timber:
• Legal and illegal logging operations
• Selective logging that opens forest canopy
• Clear-cutting for commercial timber
• Fuelwood collection for household energy
• Paper and pulp industry demands

Infrastructure Development:
• Road construction and transportation corridors
• Urban expansion and residential development
• Mining operations and resource extraction
• Dam construction and hydroelectric projects
• Industrial facility development

Economic Drivers:
• Poverty and lack of alternative livelihoods
• Short-term economic incentives over conservation
• Weak governance and law enforcement
• Subsidies that encourage forest conversion
• International market demands for commodities

Social Factors:
• Population growth and settlement pressure
• Displacement of indigenous communities
• Lack of land tenure security
• Limited environmental education
• Cultural practices and traditional uses

Solutions Approach:
• Sustainable agriculture and intensification
• Forest law enforcement and governance
• Economic incentives for conservation
• Community-based forest management
• International cooperation and certification`
    },
    'climate-change': {
      title: 'Climate Change & Forests',
      content: `Forests play a critical role in climate regulation while being vulnerable to climate impacts.

Forests as Carbon Sinks:
• Trees absorb CO2 from atmosphere during photosynthesis
• Carbon stored in biomass, roots, and forest soils
• Old-growth forests store most carbon per hectare
• Reforestation can sequester 1-2 tons CO2 per hectare annually
• Deforestation releases stored carbon to atmosphere

Climate Impacts on Forests:
• Rising temperatures affect species composition
• Changes in precipitation patterns stress trees
• Increased frequency of droughts and fires
• Pest and disease outbreaks in stressed forests
• Shifting suitable habitat zones for species

Forest Climate Benefits:
• Evapotranspiration cools local temperatures
• Forests moderate extreme weather events
• Windbreaks reduce soil erosion and crop damage
• Urban forests reduce heat island effects
• Forests buffer against climate variability

Adaptation Strategies:
• Plant climate-resilient species and genotypes
• Increase species diversity for ecosystem resilience
• Connect fragmented forests with corridors
• Restore degraded lands to increase forest cover
• Manage forests for multiple ecosystem services

Mitigation Potential:
• Reforestation and afforestation programs
• Reduced emissions from deforestation (REDD+)
• Sustainable forest management practices
• Urban forestry for energy savings
• Wood products for carbon storage and fossil fuel substitution

Future Projections:
• Forest distribution will shift with climate zones
• Some species will face increased extinction risk
• New conservation strategies needed for resilience
• Technology integration for monitoring and management
• International cooperation essential for global benefits`
    },
    'wildlife-conservation': {
      title: 'Wildlife Conservation',
      content: `Reforestation is fundamental for wildlife habitat restoration and biodiversity conservation.

Habitat Restoration:
• Native forests provide essential wildlife habitat
• Different forest layers support diverse species
• Dead trees and logs provide nesting and shelter
• Forest streams and clearings create habitat diversity
• Corridors connect fragmented habitat patches

Species Recovery:
• Many endangered species depend on forest habitats
• Reforestation can reverse population declines
• Native tree species support native wildlife better
• Diverse forest structure accommodates different species
• Large forest blocks support wide-ranging species

Food Web Restoration:
• Trees provide fruits, nuts, and seeds for wildlife
• Insects on native trees feed birds and small mammals
• Predator-prey relationships restored in forests
• Pollinators benefit from forest flowers
• Decomposers process forest litter and organic matter

Planning for Wildlife:
• Include diverse native species in plantings
• Create varied forest structure and age classes
• Maintain some open areas and edge habitat
• Preserve and create water sources
• Minimize human disturbance during sensitive periods

Monitoring Wildlife Recovery:
• Bird surveys indicate forest habitat quality
• Camera traps monitor mammal populations
• Butterfly and pollinator surveys show ecosystem health
• Track return of indicator species
• Document breeding success and population trends

Threats to Address:
• Invasive species competition
• Fragmentation and isolation effects
• Human-wildlife conflicts near settlements
• Pollution impacts on forest ecosystems
• Climate change effects on habitat suitability

Conservation Strategies:
• Landscape-scale planning and connectivity
• Protected area establishment and expansion
• Community-based wildlife monitoring
• Sustainable use practices and ecotourism
• Research and adaptive management`
    },
    'case-studies': {
      title: 'Case Studies / Success Stories',
      content: `Learn from successful reforestation projects around the world.

Costa Rica's Forest Recovery:
• Forest cover increased from 17% to 54% (1985-2019)
• Payments for ecosystem services program
• Combination of natural regeneration and active planting
• Ecotourism revenue supports conservation
• Strong environmental policies and enforcement

China's Grain for Green Program:
• World's largest reforestation program since 1999
• Converted 32 million hectares of farmland to forest
• Reduced soil erosion and improved water quality
• Provided income support for participating farmers
• Significant carbon sequestration benefits

Atlantic Forest Restoration (Brazil):
• Mata Atlântica restoration in biodiversity hotspot
• Partnership between NGOs, government, and landowners
• Native species propagation and planting techniques
• Research on restoration ecology and methods
• Connection of forest fragments for wildlife

Miyawaki Method (Japan):
• Dense native forest restoration technique
• Creates forests 30 times faster than traditional methods
• Uses only indigenous species adapted to local conditions
• Applied successfully in urban and rural areas worldwide
• Community involvement in planting and maintenance

African Forest Landscape Restoration:
• Great Green Wall initiative across Sahel region
• Community-based approaches with multiple benefits
• Integration with agriculture and livestock systems
• Focus on dryland restoration and desertification control
• Women's leadership in restoration activities

Key Success Factors:
• Long-term commitment and sustained funding
• Science-based planning and adaptive management
• Strong community participation and ownership
• Policy support and institutional frameworks
• Monitoring and evaluation systems
• Integration with economic development goals`
    },
    'articles-blogs': {
      title: 'Articles & Blogs',
      content: `Stay informed with the latest research and insights on reforestation and forest conservation.

Scientific Journals:
• Forest Ecology and Management - peer-reviewed research
• Restoration Ecology - restoration science and practice
• Forest Policy and Economics - policy and economic analysis
• Frontiers in Forests and Global Change - open access research
• Journal of Applied Ecology - practical conservation science

Popular Science Publications:
• National Geographic - environmental photography and stories
• Scientific American - accessible science communication
• Nature News - breaking research developments
• Yale Environment 360 - environmental journalism
• Mongabay - tropical forest and biodiversity news

Organization Blogs:
• World Resources Institute - data-driven analysis
• Rainforest Alliance - sustainable agriculture and forestry
• Forest Trends - market-based conservation solutions
• International Union for Conservation of Nature (IUCN)
• Food and Agriculture Organization (FAO) Forestry

Research Institutions:
• World Forest Institute - policy and practice integration
• Center for International Forestry Research (CIFOR)
• Smithsonian Environmental Research Center
• University forest research centers worldwide
• Government forest research agencies

Topic Areas:
• Climate change and carbon sequestration
• Biodiversity conservation and restoration
• Sustainable forest management practices
• Community-based forestry approaches
• Technology applications in forestry
• Policy analysis and recommendations

Staying Updated:
• Subscribe to email newsletters and alerts
• Follow social media accounts of key organizations
• Attend virtual webinars and conferences
• Join professional networks and associations
• Set up Google Scholar alerts for research topics`
    },
    'infographics-maps': {
      title: 'Infographics & Maps',
      content: `Visual resources help communicate complex forestry information effectively.

Interactive Maps:
• Global Forest Watch - real-time deforestation tracking
• World Wildlife Fund Forest Atlas - regional forest data
• NASA Earth Observatory - satellite imagery and analysis
• Forest Landscape Integrity Index - forest condition mapping
• Climate Change Knowledge Portal - climate impact maps

Infographic Topics:
• Forest cover change over time
• Carbon storage in different forest types
• Biodiversity hotspots and conservation priorities
• Deforestation drivers and impacts
• Reforestation techniques and benefits
• Forest ecosystem services valuation

Data Visualization:
• Charts showing forest trends and statistics
• Diagrams of forest structure and species
• Process flows for reforestation planning
• Before-and-after restoration comparisons
• Economic analysis of forest investments

Educational Graphics:
• Tree identification guides with illustrations
• Forest ecosystem food webs and relationships
• Climate change impacts on forest species
• Sustainable forestry practice demonstrations
• Community forestry success story timelines

Creating Visual Content:
• Use consistent color schemes and fonts
• Include data sources and methodology
• Make content accessible for different audiences
• Combine text, images, and data effectively
• Test comprehension with target users

Tools and Resources:
• Canva and Adobe Creative Suite for design
• Tableau and Power BI for data visualization
• R and Python for statistical graphics
• QGIS and ArcGIS for mapping
• Online infographic templates and tools

Best Practices:
• Start with clear objectives and key messages
• Use appropriate chart types for data
• Minimize text and maximize visual impact
• Ensure accessibility for diverse audiences
• Update content regularly with new data`
    },
    'videos-tutorials': {
      title: 'Videos & Tutorials',
      content: `Learn reforestation techniques through visual demonstrations and expert guidance.

Educational Video Topics:
• Tree planting techniques and best practices
• Nursery establishment and seedling production
• Site preparation and soil assessment
• Species selection for different conditions
• Forest restoration monitoring methods

Expert Interviews:
• Research scientists discussing latest findings
• Community leaders sharing local experiences
• Policy makers explaining conservation strategies
• Indigenous knowledge holders on traditional practices
• Restoration practitioners demonstrating techniques

Documentary Films:
• The Man Who Planted Trees - classic animation
• Fantastic Fungi - forest ecosystem connections
• Kiss the Ground - regenerative agriculture and forests
• Our Planet - forest episodes showcasing biodiversity
• Before the Flood - climate change and deforestation

Tutorial Series:
• Step-by-step planting guides for beginners
• Advanced techniques for restoration professionals
• Equipment selection and maintenance
• Data collection and monitoring protocols
• Drone technology for forest monitoring

Virtual Field Trips:
• Visit successful restoration sites worldwide
• Explore different forest ecosystems
• Learn from community-based projects
• See technology applications in practice
• Understand policy implementation

Platform Resources:
• YouTube channels of forestry organizations
• University extension service videos
• TED Talks on environmental conservation
• Coursera and EdX online courses
• Webinar recordings from professional conferences

Production Tips:
• Keep videos focused and concise
• Use high-quality audio and visuals
• Include captions and multiple languages
• Provide supplementary resources
• Enable comments for community learning

Creating Your Own:
• Document local restoration projects
• Share traditional knowledge and practices
• Train community members in techniques
• Advocate for forest conservation policies
• Inspire others to take action`
    },
    'podcasts-interviews': {
      title: 'Podcasts / Interviews',
      content: `Listen to expert insights and stories from the world of forest restoration and conservation.

Popular Forestry Podcasts:
• Forest Talk - interviews with forest professionals
• Trees & Coffee - conversations on agroforestry
• Forest 2 Market - industry insights and market trends
• Completely Optional Knowledge - quirky forest science
• Nature Podcast - includes forest and climate research

Interview Topics:
• Career paths in forestry and conservation
• Indigenous forest management wisdom
• Climate change adaptation strategies
• Community forestry success stories
• Technology innovations in restoration
• Policy developments and challenges

Featured Experts:
• Research scientists from universities
• NGO leaders and conservationists
• Government foresters and policy makers
• Community leaders and indigenous practitioners
• Private sector restoration professionals
• International development specialists

Storytelling Approaches:
• Personal journeys in forest conservation
• Restoration project case studies
• Day-in-the-life of forest professionals
• Historical perspectives on forest management
• Future visions for forest landscapes

Technical Discussions:
• Latest research findings and methodologies
• Best practices for different forest types
• Monitoring and evaluation techniques
• Funding mechanisms and financial models
• Policy analysis and recommendations
• Technology applications and innovations

Creating Content:
• Identify interesting guests and topics
• Prepare thoughtful questions in advance
• Use quality recording equipment
• Edit for clarity and engagement
• Promote through relevant networks
• Build consistent publishing schedule

Listening Benefits:
• Stay current with field developments
• Learn from diverse perspectives
• Get inspired by success stories
• Understand complex issues better
• Connect with the broader community
• Multitask while learning

Finding Podcasts:
• Search forestry and environmental keywords
• Check websites of relevant organizations
• Ask colleagues for recommendations
• Explore podcast directories and apps
• Follow social media for new releases`
    },
    'quizzes-challenges': {
      title: 'Quizzes & Challenges',
      content: `Test your knowledge and participate in engaging forestry learning activities.

Quiz Categories:
• Tree identification and species knowledge
• Forest ecology and ecosystem functions
• Reforestation techniques and best practices
• Climate change and forest interactions
• Forest conservation policies and programs
• Sustainable forest management principles

Interactive Challenges:
• Plant identification photo contests
• Forest monitoring data interpretation
• Design a restoration plan for specific sites
• Calculate carbon sequestration potential
• Develop community engagement strategies
• Create forest management scenarios

Gamification Elements:
• Points and badges for completing activities
• Leaderboards for friendly competition
• Progress tracking through learning paths
• Unlockable content and advanced levels
• Team challenges and collaborative projects
• Real-world application assignments

Educational Objectives:
• Reinforce key concepts and terminology
• Apply theoretical knowledge to practical situations
• Develop critical thinking and problem-solving skills
• Encourage active learning and engagement
• Build confidence in forestry knowledge
• Motivate continued learning and exploration

Assessment Methods:
• Multiple choice questions with explanations
• Image-based identification exercises
• Case study analysis and recommendations
• Hands-on field exercises and measurements
• Group projects and peer evaluation
• Self-reflection and learning journals

Platform Features:
• Mobile-friendly design for field use
• Offline capability for remote locations
• Integration with learning management systems
• Social sharing and collaboration tools
• Analytics and progress tracking
• Adaptive content based on performance

Creating Quizzes:
• Start with clear learning objectives
• Use varied question types and formats
• Include relevant images and scenarios
• Provide immediate feedback and explanations
• Test difficulty levels with target audience
• Update content regularly with new information

Benefits for Learners:
• Active engagement with content
• Immediate feedback on understanding
• Motivation through achievement systems
• Social learning and competition
• Practical skill development
• Confidence building in knowledge areas`
    },
    'volunteer-opportunities': {
      title: 'Volunteer Opportunities',
      content: `Get involved in hands-on reforestation and forest conservation activities.

Tree Planting Events:
• Community forestry projects and restoration sites
• Urban forest initiatives and park improvements
• School and university campus tree planting
• Corporate volunteer days and team building
• Earth Day and Arbor Day celebration events
• Indigenous land restoration partnerships

Citizen Science Projects:
• Forest monitoring and data collection
• Tree health assessments and disease tracking
• Biodiversity surveys and species inventories
• Climate change impact documentation
• Water quality monitoring in forested watersheds
• Phenology observations and seasonal tracking

Nursery and Propagation:
• Seed collection from native parent trees
• Greenhouse management and seedling care
• Potting, watering, and transplanting activities
• Native plant society events and plant sales
• School garden and outdoor education programs
• Botanical garden conservation initiatives

Advocacy and Education:
• Environmental education and outreach programs
• Policy advocacy and campaign support
• Fundraising events and donor stewardship
• Social media content creation and management
• Photography and documentation projects
• Translation and multilingual content development

Skills-Based Volunteering:
• GIS mapping and spatial analysis
• Website development and maintenance
• Graphic design for educational materials
• Grant writing and funding applications
• Project management and coordination
• Financial management and bookkeeping

Finding Opportunities:
• Search online volunteer databases
• Contact local environmental organizations
• Check with government forest agencies
• Connect with university research programs
• Join professional forestry associations
• Follow social media for event announcements

Preparing to Volunteer:
• Dress appropriately for outdoor work
• Bring water, snacks, and sun protection
• Learn basic plant identification skills
• Understand safety protocols and procedures
• Arrive on time and ready to learn
• Ask questions and engage with organizers

Benefits of Volunteering:
• Hands-on learning and skill development
• Networking with like-minded individuals
• Contributing to meaningful environmental work
• Building resume and gaining experience
• Personal satisfaction and sense of purpose
• Connecting with nature and outdoors`
    },
    'citizen-science': {
      title: 'Citizen Science Projects',
      content: `Contribute to forest research and conservation through citizen science initiatives.

Data Collection Projects:
• iNaturalist - biodiversity observations and species mapping
• eBird - bird surveys in forest habitats
• Journey North - tracking seasonal changes and migration
• Forest Watch - monitoring forest health and disturbances
• Project BudBurst - phenology observations
• Globe Observer - land cover assessment

Tree Monitoring:
• TreeMap - urban tree inventory and condition
• Forest Health Monitoring - pest and disease tracking
• ClimateWatch - climate change impact documentation
• TreeRadar - forest structure measurement using smartphones
• Canopy Cover Assessment - measuring forest density
• Growth Rate Studies - long-term tree measurement

Technology-Enhanced Projects:
• Smartphone apps for data collection
• GPS mapping of forest features
• Digital photography for documentation
• Drone surveys and aerial imagery
• Sensor networks for environmental monitoring
• Online data entry and quality control

Research Contributions:
• Large-scale data collection across regions
• Long-term monitoring and trend analysis
• Validation of remote sensing data
• Baseline establishment for restoration projects
• Climate change impact assessment
• Biodiversity pattern documentation

Training and Support:
• Online tutorials and field guides
• Expert verification of observations
• Community forums and discussion groups
• Regular feedback on contributions
• Recognition and achievement systems
• Scientific publication acknowledgments

Project Benefits:
• Democratize scientific research participation
• Generate large datasets for analysis
• Engage public in environmental monitoring
• Build scientific literacy and awareness
• Support conservation decision-making
• Create lasting connections to nature

Getting Started:
• Choose projects matching your interests and location
• Download required apps and create accounts
• Complete training modules and tutorials
• Start with simple observations and measurements
• Connect with local coordinators and groups
• Share experiences and learn from others`
    },
    'gamified-learning': {
      title: 'Gamified Learning',
      content: `Make forest education fun and engaging through game-based learning approaches.

Educational Games:
• Forest ecosystem simulation games
• Tree identification matching games
• Carbon cycle interactive puzzles
• Virtual forest management scenarios
• Species conservation strategy games
• Climate change adaptation challenges

Mobile Apps:
• PlantNet - AI-powered plant identification
• Seek by iNaturalist - camera-based species ID
• Forest Adventure - educational exploration game
• Tree Story - interactive forest growth simulation
• EcoChain - ecosystem relationship puzzles
• Carbon Footprint Calculator - personal impact games

Classroom Activities:
• Forest role-playing scenarios
• Biodiversity board games and card games
• Hands-on ecosystem model building
• Scavenger hunts for forest features
• Team competitions and challenges
• Interactive presentations and demos

Virtual Reality Experiences:
• Immersive forest ecosystem exploration
• Time-lapse forest succession visualization
• Climate change impact simulations
• Restoration project virtual field trips
• Microscopic forest life examination
• Historical forest landscape recreation

Achievement Systems:
• Badges for knowledge milestones
• Points for participation and accuracy
• Leaderboards for friendly competition
• Certificates for course completion
• Physical rewards for real-world actions
• Social recognition and sharing

Learning Outcomes:
• Increased engagement and motivation
• Better retention of complex concepts
• Development of problem-solving skills
• Enhanced collaboration and teamwork
• Real-world application of knowledge
• Positive attitudes toward conservation

Design Principles:
• Clear objectives and meaningful challenges
• Progressive difficulty and skill building
• Immediate feedback and recognition
• Social interaction and collaboration
• Connection to real-world applications
• Accessibility for diverse learners`
    },
    'ebooks-research': {
      title: 'eBooks & Research Papers',
      content: `Access comprehensive resources for in-depth forest knowledge and research.

Essential eBooks:
• "The Hidden Life of Trees" by Peter Wohlleben
• "Forest Restoration in Human-Dominated Landscapes" 
• "Reforestation Challenges and Solutions Handbook"
• "Community-Based Forest Management Guide"
• "Climate Change and Forest Adaptation Strategies"
• "Sustainable Forestry Practices Manual"

Academic Journals:
• Forest Ecology and Management
• Restoration Ecology
• Journal of Forestry
• Forest Policy and Economics
• Ecological Applications
• Conservation Biology

Research Databases:
• Google Scholar - free academic search
• ResearchGate - researcher networking
• Academia.edu - academic paper sharing
• JSTOR - academic journal archive
• SpringerLink - scientific publications
• Wiley Online Library - research articles

Government Publications:
• FAO State of the World's Forests reports
• USDA Forest Service research publications
• IPCC reports on land use and climate
• National forest inventory reports
• Climate change assessment reports
• Biodiversity strategy and action plans

Topic Areas:
• Forest ecology and ecosystem dynamics
• Restoration techniques and methodologies
• Community forestry and social aspects
• Climate change impacts and adaptation
• Forest economics and policy analysis
• Technology applications in forestry

Open Access Resources:
• PLOS ONE environmental research
• Frontiers in Forests and Global Change
• Nature Conservation open access papers
• BioMed Central ecology journals
• Directory of Open Access Journals
• ArXiv preprints in relevant fields

Reading Strategies:
• Start with abstracts and conclusions
• Focus on methodology and results sections
• Look for recent meta-analyses and reviews
• Check citation patterns for key papers
• Follow specific authors and institutions
• Set up alerts for new publications

Research Skills:
• Develop critical reading abilities
• Learn to evaluate source credibility
• Practice synthesizing information
• Understand statistical methods
• Connect theory to practical applications
• Stay current with field developments`
    },
    'external-organizations': {
      title: 'External Organizations & Links',
      content: `Connect with leading organizations working on reforestation and forest conservation.

International Organizations:
• Food and Agriculture Organization (FAO) - forestry.fao.org
• International Union for Conservation of Nature (IUCN) - iucn.org
• World Wildlife Fund (WWF) - worldwildlife.org
• Conservation International - conservation.org
• World Resources Institute - wri.org
• Rainforest Alliance - rainforest-alliance.org

Research Institutions:
• Center for International Forestry Research (CIFOR) - cifor.org
• World Forest Institute - worldforestinstitute.org
• Smithsonian Environmental Research Center - serc.si.edu
• International Institute for Tropical Agriculture - iita.org
• Tropical Forest Research Institute - tfri.res.in
• Forest Research Institute Malaysia - frim.gov.my

Government Agencies:
• USDA Forest Service - fs.usda.gov
• Natural Resources Canada - nrcan.gc.ca
• UK Forestry Commission - gov.uk/forestry-commission
• Australian Department of Agriculture - agriculture.gov.au
• Indian Forest Service - forest.gov.in
• Brazilian Forest Service - florestal.gov.br

NGOs and Nonprofits:
• Trees for the Future - trees.org
• One Tree Planted - onetreeplanted.org
• The Nature Conservancy - nature.org
• Arbor Day Foundation - arborday.org
• Eden Reforestation Projects - edenprojects.org
• Plant-for-the-Planet - plant-for-the-planet.org

Professional Associations:
• Society of American Foresters - eforester.org
• International Association of Forest Research Organizations - iufro.org
• Commonwealth Forestry Association - cfa-international.org
• Society for Ecological Restoration - ser.org
• Association of Forest Service Employees - afseee.org
• International Union of Forest Research Organizations

Technology Partners:
• Global Forest Watch - globalforestwatch.org
• NASA Earth Observatory - earthobservatory.nasa.gov
• Google Earth Engine - earthengine.google.com
• Forest Trends - forest-trends.org
• Climate Policy Initiative - climatepolicyinitiative.org
• World Bank Forest Action Plan - worldbank.org

Funding Organizations:
• Global Environment Facility - thegef.org
• Green Climate Fund - greenclimate.fund
• Forest Investment Program - climateinvestmentfunds.org
• MacArthur Foundation - macfound.org
• Ford Foundation - fordfoundation.org
• Bill & Melinda Gates Foundation - gatesfoundation.org

Networking Benefits:
• Access to latest research and best practices
• Collaboration opportunities and partnerships
• Funding and grant opportunities
• Technical assistance and capacity building
• Policy advocacy and influence
• Professional development and training`
    },
    'government-guidelines': {
      title: 'Government Guidelines',
      content: `Understanding policy frameworks and regulations for forest restoration and management.

National Forest Policies:
• National Forest Strategy and action plans
• Biodiversity conservation strategies
• Climate change adaptation frameworks
• Sustainable development goal alignments
• Land use planning and zoning regulations
• Environmental protection laws

Reforestation Guidelines:
• Species selection and approval processes
• Site preparation and planting standards
• Monitoring and reporting requirements
• Survival rate and success criteria
• Maintenance and long-term care protocols
• Native species conservation priorities

Permitting and Approvals:
• Environmental impact assessment requirements
• Land use change permits and approvals
• Water use permits for irrigation
• Pesticide use restrictions and guidelines
• Construction and access road regulations
• Protected area and buffer zone rules

Funding Programs:
• Government reforestation grants and subsidies
• Tax incentives for forest conservation
• Payment for ecosystem services schemes
• Carbon credit programs and markets
• International development funding
• Private sector partnership opportunities

Compliance Requirements:
• Regular monitoring and progress reporting
• Financial auditing and accountability
• Environmental safeguards and protections
• Social impact assessments and consultations
• Labor standards and safety requirements
• Procurement and contracting regulations

Indigenous Rights:
• Free, prior, and informed consent protocols
• Traditional territory recognition
• Indigenous knowledge integration
• Benefit-sharing agreements
• Cultural heritage protection
• Land tenure and use rights

International Frameworks:
• UN Framework Convention on Climate Change
• Convention on Biological Diversity
• UN Sustainable Development Goals
• REDD+ (Reducing Emissions from Deforestation)
• Paris Agreement forest commitments
• International tropical timber agreements

Implementation Support:
• Technical assistance programs
• Capacity building and training
• Research and development support
• Technology transfer initiatives
• Public-private partnerships
• Community engagement guidelines

Staying Updated:
• Subscribe to government newsletters
• Attend policy briefings and workshops
• Join stakeholder consultation processes
• Monitor regulatory changes and updates
• Connect with government liaisons
• Participate in policy development`
    },
    'community-forums': {
      title: 'Community Forums / Discussion Boards',
      content: `Connect with fellow forest enthusiasts, practitioners, and experts in online communities.

Professional Forums:
• Forest Connect - global forestry networking platform
• Arborist Exchange - tree care and management discussions
• Restoration Roundtable - ecological restoration community
• Climate CoLab - collaborative climate solutions
• ResearchGate - academic researcher networking
• LinkedIn Forestry Groups - professional networking

General Interest Communities:
• Reddit r/forestry - general forestry discussions
• Reddit r/marijuanaenthusiasts - actual tree enthusiasts
• TreeBuzz - arborist and tree care community
• Permies.com - permaculture and sustainable living
• Gardening forums with native plant sections
• Facebook groups for local forest communities

Regional Networks:
• State and provincial forestry associations
• Local native plant societies
• Watershed conservation groups
• Land trust and conservation organizations
• Indigenous forestry networks
• Urban forestry municipal groups

Specialized Topics:
• Forest pathology and disease management
• Forest economics and policy analysis
• Wildlife habitat management
• Fire management and prevention
• Sustainable harvesting practices
• Forest carbon and climate change

Educational Communities:
• University extension forums
• Online course discussion boards
• Webinar follow-up discussions
• Student and educator networks
• Citizen science project communities
• Volunteer coordinator platforms

Discussion Guidelines:
• Be respectful and constructive in conversations
• Share experiences and practical knowledge
• Ask specific questions for better responses
• Provide context for location and conditions
• Include photos when relevant and helpful
• Follow community rules and moderation policies

Benefits of Participation:
• Learn from diverse experiences and perspectives
• Get answers to specific technical questions
• Stay updated on latest developments
• Build professional networks and relationships
• Share successes and learn from failures
• Find collaboration and partnership opportunities

Contributing Value:
• Share successful techniques and results
• Provide helpful resources and links
• Mentor newcomers to the field
• Offer constructive feedback and advice
• Document and share case studies
• Facilitate connections between members

Platform Features:
• Search previous discussions and archives
• Subscribe to topics of interest
• Private messaging for direct connections
• File sharing for documents and images
• Event calendars and announcements
• Mobile apps for on-the-go access`
    }
  };

  // Animation effects
  useEffect(() => {
    if (sidebarOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (chatbotOpen) {
      Animated.timing(chatScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(chatScaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [chatbotOpen]);

  const toggleSection = (sectionId: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleContentSelect = (contentId: string): void => {
    setSelectedContent(contentId);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleMainContentPress = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const sendMessage = (): void => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      type: 'user',
      message: chatInput.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setTyping(true);

    setTimeout(() => {
      const botMessage: ChatMessage = {
        type: 'bot',
        message: 'Thank you for your question! This is a **demo response**. In a real implementation, this would connect to an AI service to provide detailed answers about **reforestation topics**.',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setTyping(false);
    }, 1500);
  };

  const parseMessageToJSX = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {boldText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const TypingIndicator = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 16 }}>
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#6b7280',
                marginHorizontal: 3,
                opacity: 0.6
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Overlay */}
      {sidebarOpen && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            opacity: overlayAnim,
            zIndex: 1,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={closeSidebar}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          backgroundColor: '#ffffff',
          transform: [{ translateX: slideAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 10,
          zIndex: 2,
        }}
      >
        {/* Sidebar Header */}
        <View style={{ 
          padding: 20, 
          borderBottomWidth: 1, 
          borderBottomColor: '#e5e7eb',
          paddingTop: Platform.OS === 'ios' ? 60 : 24,
          backgroundColor: '#f8fafc'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                backgroundColor: '#dcfce7',
                padding: 8,
                borderRadius: 12,
                marginRight: 12
              }}>
                <Ionicons name="leaf-outline" size={20} color="#16a34a" />
              </View>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: '#166534',
                letterSpacing: 0.3
              }}>
                Education Center
              </Text>
            </View>
            <TouchableOpacity 
              onPress={closeSidebar} 
              style={{ 
                padding: 8,
                backgroundColor: '#e2e8f0',
                borderRadius: 8
              }}
            >
              <Ionicons name="close" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>


        {/* Sidebar Content */}
        <ScrollView 
          style={{ flex: 1, backgroundColor: '#ffffff' }} 
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {navigationSections.map((section) => (
            <View key={section.id} style={{ 
              borderBottomWidth: 1, 
              borderBottomColor: '#f1f5f9',
              marginHorizontal: 12,
              marginVertical: 4
            }}>
              <TouchableOpacity
                onPress={() => toggleSection(section.id)}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: 16, 
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  marginBottom: 4
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    backgroundColor: '#f0f9ff',
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 16
                  }}>
                    <Ionicons name={section.icon} size={18} color="#0369a1" />
                  </View>
                  <Text style={{ 
                    fontWeight: '600', 
                    color: '#1e293b', 
                    fontSize: 15,
                    flex: 1,
                    letterSpacing: 0.2
                  }}>
                    {section.title}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#f1f5f9',
                  padding: 6,
                  borderRadius: 6
                }}>
                  <Ionicons 
                    name={expandedSections[section.id] ? "chevron-down" : "chevron-forward"} 
                    size={16} 
                    color="#64748b" 
                  />
                </View>
              </TouchableOpacity>
              
              {expandedSections[section.id] && (
                <View style={{ 
                  paddingBottom: 8,
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  marginTop: -4,
                  paddingTop: 8
                }}>
                  {section.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleContentSelect(item.id)}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        marginHorizontal: 8,
                        marginVertical: 2,
                        backgroundColor: selectedContent === item.id ? '#dcfce7' : 'transparent',
                        borderRadius: 8,
                        borderLeftWidth: selectedContent === item.id ? 3 : 0,
                        borderLeftColor: selectedContent === item.id ? '#16a34a' : 'transparent'
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: selectedContent === item.id ? '#15803d' : '#64748b',
                        fontWeight: selectedContent === item.id ? '600' : '400',
                        letterSpacing: 0.1,
                        paddingLeft: 16
                      }}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
      )}

      {/* Main Content */}
<View style={{ flex: 1 }}>
  {/* Header */}
  <View
    style={{
      backgroundColor: '#ffffff',
      paddingHorizontal: 20,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      flexDirection: 'row',
      alignItems: 'center'
    }}
  >
    <TouchableOpacity
      onPress={toggleSidebar}
      style={{
        padding: 12,
        marginRight: 16,
        borderRadius: 8,
        backgroundColor: '#f9fafb'
      }}
    >
      <Ionicons name="menu" size={24} color="#374151" />
    </TouchableOpacity>
    <Text
      style={{
        fontSize: 22,
        fontWeight: 'bold',
        color: '#166534',
        flex: 1,
        letterSpacing: 0.5
      }}
    >
      Green Step Education
    </Text>
  </View>

  {/* Scrollable Content */}
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
    showsVerticalScrollIndicator={false}
  >
    {contentData[selectedContent] ? (
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 24,
            lineHeight: 36,
            paddingHorizontal: 4
          }}
        >
          {contentData[selectedContent].title}
        </Text>
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            marginHorizontal: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#f1f5f9'
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#374151',
              lineHeight: 26,
              letterSpacing: 0.3
            }}
          >
            {contentData[selectedContent].content}
          </Text>
        </View>
      </View>
    ) : (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 60
        }}
      >
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 40,
            marginHorizontal: 8,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 6,
            maxWidth: 420,
            width: '100%',
            borderWidth: 1,
            borderColor: '#f1f5f9'
          }}
        >
          <View
            style={{
              backgroundColor: '#dcfce7',
              padding: 20,
              borderRadius: 50,
              marginBottom: 24
            }}
          >
            <Ionicons name="leaf-outline" size={48} color="#16a34a" />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 16,
              textAlign: 'center',
              letterSpacing: 0.5
            }}
          >
            Welcome to Green Step Education
          </Text>
          <Text
            style={{
              color: '#6b7280',
              marginBottom: 32,
              textAlign: 'center',
              fontSize: 16,
              lineHeight: 24,
              paddingHorizontal: 8
            }}
          >
            Select a topic from the menu to start learning about reforestation and environmental conservation.
          </Text>
          <TouchableOpacity
            onPress={() => {
              toggleSection('basics');
              setSidebarOpen(true);
            }}
            style={{
              backgroundColor: '#16a34a',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              shadowColor: '#16a34a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: 16,
                letterSpacing: 0.5
              }}
            >
              Start with the Basics
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </ScrollView>
</View>


      {/* Chatbot */}
{chatbotOpen && (
  <Animated.View
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#373435',
      zIndex: 50,
      transform: [{ scale: chatScaleAnim }],
    }}
  >
    {/* Chat Header */}
    <View
      style={{
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#373435'
      }}
    >
      <View>
        <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', letterSpacing: 0.5 }}>Max</Text>
        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>AI Assistant</Text>
      </View>
      <TouchableOpacity
        onPress={() => setChatbotOpen(false)}
        style={{
          backgroundColor: '#373435',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>Close</Text>
      </TouchableOpacity>
    </View>

    {/* Messages */}
    <ScrollView
      style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {chatMessages
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((msg, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 16
            }}
          >
            <View
              style={{
                maxWidth: '85%',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: msg.type === 'user' ? '#808080' : '#ffffff',
                borderWidth: 1,
                borderColor: msg.type === 'user' ? '#1D1D1D' : '#6b7280',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text style={{
                fontSize: 15,
                color: '#000000',
                lineHeight: 22,
                letterSpacing: 0.2
              }}>
                {parseMessageToJSX(msg.message)}
              </Text>
            </View>
          </View>
        ))}

      {typing && <TypingIndicator />}
    </ScrollView>

    {/* Input Area */}
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#373435',
        backgroundColor: '#000000'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TextInput
          value={chatInput}
          onChangeText={setChatInput}
          onSubmitEditing={sendMessage}
          placeholder="Ask Max..."
          placeholderTextColor="#9ca3af"
          multiline
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: '#000000',
            maxHeight: 120,
            minHeight: 48,
            borderWidth: 1,
            borderColor: '#e5e7eb'
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: '#373435',
            marginLeft: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 0.5,
            borderColor: '#727376',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </Animated.View>
)}

    </View>
  );
};

export default EducationTab;