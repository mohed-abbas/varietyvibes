const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// Initialize Firebase Admin using environment variables
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = getFirestore(app);

// Sample posts data based on content directory
const samplePosts = [
  {
    title: "Health Insurance 101: Understanding Your Coverage Options and Costs",
    description: "A comprehensive beginner's guide to health insurance, covering plan types, key terms, enrollment periods, and how to choose the right coverage for your needs.",
    content: `# Health Insurance 101: Understanding Your Coverage Options and Costs

Navigating the world of health insurance can feel overwhelming, especially with complex terminology and numerous plan options. Whether you're choosing coverage through your employer, shopping on the marketplace, or considering Medicare, understanding the basics will help you make informed decisions about your healthcare coverage.

## What is Health Insurance?

Health insurance is a contract between you and an insurance company where you pay monthly premiums in exchange for coverage of medical expenses. The insurer agrees to pay for certain healthcare costs, helping protect you from high medical bills.

## Types of Health Insurance Plans

### Health Maintenance Organization (HMO)
**How it works**: You choose a primary care physician (PCP) who coordinates all your care and provides referrals to specialists.

**Pros**:
- Lower premiums and out-of-pocket costs
- Predictable copayments
- Coordinated care through your PCP

**Cons**:
- Limited to network providers
- Requires referrals for specialists
- Less flexibility in provider choice

**Best for**: People who want lower costs and don't mind having their care coordinated through a primary care physician.

### Preferred Provider Organization (PPO)
**How it works**: You have flexibility to see any healthcare provider, but pay less when using in-network providers.

**Pros**:
- No referrals needed for specialists
- Can see out-of-network providers (at higher cost)
- More flexibility and choice

**Cons**:
- Higher premiums than HMOs
- Higher out-of-pocket costs
- More complex to navigate

**Best for**: People who want flexibility and are willing to pay more for provider choice.

## Key Health Insurance Terms

### Premium
The monthly amount you pay for your health insurance coverage, regardless of whether you use healthcare services.

### Deductible
The amount you must pay out-of-pocket for covered services before your insurance begins to pay. For example, with a $2,000 deductible, you pay the first $2,000 of covered medical expenses.

### Copayment (Copay)
A fixed amount you pay for a covered service, typically at the time of service. For example, $25 for a doctor visit or $10 for a prescription.

### Coinsurance
Your share of costs after meeting your deductible, expressed as a percentage. With 20% coinsurance, you pay 20% of covered services and your insurance pays 80%.

## Understanding Plan Categories (Metal Tiers)

### Bronze Plans
- **Premium**: Lowest monthly cost
- **Deductible**: Highest ($6,000+ typical)
- **Coverage**: Pays about 60% of healthcare costs
- **Best for**: Healthy individuals who want catastrophic protection

### Silver Plans
- **Premium**: Moderate monthly cost
- **Deductible**: Moderate ($3,000-5,000 typical)
- **Coverage**: Pays about 70% of healthcare costs
- **Best for**: Most people, especially those eligible for cost-sharing reductions

### Gold Plans
- **Premium**: Higher monthly cost
- **Deductible**: Lower ($1,000-3,000 typical)
- **Coverage**: Pays about 80% of healthcare costs
- **Best for**: People with regular medical needs or higher incomes

## How to Choose the Right Plan

### 1. Assess Your Healthcare Needs
- How often do you visit doctors?
- Do you take regular medications?
- Do you have chronic conditions?
- Are you planning any major medical procedures?

### 2. Calculate Total Annual Costs
Don't just look at premiums. Consider:
- Monthly premiums × 12
- Estimated deductible costs
- Copayments and coinsurance
- Prescription drug costs

### 3. Check Provider Networks
- Are your current doctors in-network?
- Are your preferred hospitals included?
- How many specialists are available?
- What about emergency care access?

## Cost-Saving Strategies

### 1. Health Savings Account (HSA)
- Available with high-deductible health plans (HDHPs)
- Triple tax advantage: deductible contributions, tax-free growth, tax-free withdrawals for medical expenses
- 2024 contribution limits: $4,150 individual, $8,300 family

### 2. Flexible Spending Account (FSA)
- Use pre-tax dollars for medical expenses
- 2024 contribution limit: $3,200
- "Use it or lose it" rule applies

## Conclusion

Health insurance is a crucial financial protection that requires careful consideration of your healthcare needs, budget, and preferences. By understanding the different plan types, key terms, and cost factors, you can make an informed decision that provides the right balance of coverage and affordability.

The key is to be proactive about understanding your options and making informed choices that protect both your health and your financial well-being.`,
    excerpt: "A comprehensive guide to understanding health insurance options, plan types, key terms, and how to choose the right coverage for your needs.",
    categorySlug: "health-insurance",
    tags: ["health insurance", "healthcare", "coverage", "premiums", "deductibles"],
    featured: true,
    author: "Dr. Sarah Chen",
    status: "published"
  },
  {
    title: "Kitchen Renovation Guide: Transform Your Space on Any Budget",
    description: "Complete guide to kitchen renovation planning, budgeting, design tips, and execution strategies for creating your dream kitchen within your budget.",
    content: `# Kitchen Renovation Guide: Transform Your Space on Any Budget

The kitchen is often called the heart of the home, and for good reason. It's where families gather, meals are prepared, and memories are made. If your kitchen is feeling outdated, cramped, or simply not functional for your needs, a renovation might be the perfect solution.

## Planning Your Kitchen Renovation

### Setting Your Budget

Before diving into design ideas, establish a realistic budget. Kitchen renovations can range from $10,000 for minor updates to $50,000+ for complete overhauls.

**Budget Breakdown (typical percentages)**:
- Labor: 35-40%
- Cabinets: 25-30%
- Appliances: 15-20%
- Countertops: 10-15%
- Flooring: 7-10%
- Lighting/Electrical: 5%
- Paint/Finishing: 2-3%

### Design Considerations

**Kitchen Layout Options**:
- **Galley**: Two parallel counters, efficient for narrow spaces
- **L-Shaped**: Forms an L along two adjacent walls
- **U-Shaped**: Wraps around three walls, maximum storage
- **Island**: Adds workspace and storage to larger kitchens
- **Peninsula**: Connected island, good for open floor plans

## Renovation Phases

### Phase 1: Planning and Design (2-4 weeks)
1. Assess current kitchen functionality
2. Create wish list and priorities
3. Set budget and timeline
4. Hire contractor/designer if needed
5. Obtain permits if required

### Phase 2: Demolition (1-2 weeks)
- Remove old cabinets, appliances, and fixtures
- Address any structural issues
- Update electrical and plumbing rough-ins
- Install new subfloor if needed

### Phase 3: Infrastructure (1-2 weeks)
- Complete electrical and plumbing work
- Install drywall and paint
- Install flooring
- Add insulation if needed

### Phase 4: Installation (2-3 weeks)
- Install cabinets
- Add countertops
- Install appliances
- Complete plumbing and electrical fixtures
- Install backsplash

### Phase 5: Finishing Touches (1 week)
- Final paint touch-ups
- Install hardware and accessories
- Final inspections
- Deep cleaning

## Budget-Friendly Tips

### Low Budget ($5,000-15,000)
- Paint existing cabinets instead of replacing
- Update cabinet hardware
- Install new countertops
- Add under-cabinet lighting
- Update faucet and sink
- Fresh paint throughout

### Medium Budget ($15,000-30,000)
- Replace cabinet doors and drawer fronts
- Install new appliances
- Add tile backsplash
- Update lighting fixtures
- Replace flooring
- Add kitchen island or peninsula

### High Budget ($30,000+)
- Complete cabinet replacement
- Premium appliances
- Custom countertops (quartz, granite, marble)
- Structural changes (removing walls, adding windows)
- High-end finishes and fixtures
- Professional design services

## Popular Design Trends

### Timeless Elements
- White or neutral cabinets
- Subway tile backsplashes
- Natural stone countertops
- Hardwood or luxury vinyl plank flooring
- Stainless steel appliances

### Current Trends
- Two-tone cabinets
- Large format tiles
- Waterfall countertops
- Smart appliances
- Mixed metal finishes
- Statement lighting

## Choosing Materials

### Cabinets
**Solid Wood**: Durable, customizable, higher cost
**Plywood**: Good value, stable, takes paint well
**Particle Board**: Budget-friendly, limited durability
**MDF**: Smooth finish, good for painted cabinets

### Countertops
**Quartz**: Durable, non-porous, consistent patterns
**Granite**: Natural beauty, heat resistant, requires sealing
**Marble**: Elegant, heat resistant, prone to staining
**Butcher Block**: Warm, natural, requires maintenance
**Laminate**: Budget-friendly, many design options

### Backsplashes
**Subway Tile**: Classic, versatile, timeless
**Natural Stone**: Elegant, unique patterns
**Glass Tile**: Reflects light, easy to clean
**Metal**: Modern, durable, heat resistant

## Working with Professionals

### When to Hire a Contractor
- Structural changes
- Electrical or plumbing work
- Permit requirements
- Limited time or experience
- Complex installations

### Questions to Ask Contractors
1. Are you licensed and insured?
2. Can you provide recent references?
3. What's included in your estimate?
4. What's your payment schedule?
5. How do you handle change orders?
6. What's your timeline for completion?

## Common Mistakes to Avoid

### Design Mistakes
- Inadequate storage planning
- Poor lighting design
- Ignoring traffic flow
- Choosing trendy over timeless
- Forgetting about functionality

### Budget Mistakes
- Not planning for unexpected costs (add 20% buffer)
- Focusing only on aesthetics over function
- Skipping quality for cheaper options
- Not getting multiple quotes

## Maximizing Your Investment

### Focus on These Elements for Best ROI
1. **Kitchen Layout**: Efficient work triangle
2. **Storage Solutions**: Maximize every inch
3. **Quality Appliances**: Choose reliable brands
4. **Lighting**: Layer ambient, task, and accent lighting
5. **Neutral Colors**: Appeal to broader audience

### Energy Efficiency Upgrades
- ENERGY STAR appliances
- LED lighting throughout
- Proper insulation
- Efficient windows
- Smart thermostats

## Timeline Expectations

**Minor Renovation** (cosmetic updates): 2-4 weeks
**Moderate Renovation** (new cabinets, appliances): 6-8 weeks
**Major Renovation** (structural changes): 10-12 weeks

Add 2-4 weeks to any timeline for:
- Permit delays
- Custom orders
- Unexpected issues
- Holiday schedules

## Conclusion

A successful kitchen renovation requires careful planning, realistic budgeting, and attention to both form and function. Whether you're working with a modest budget or planning a complete overhaul, focus on creating a space that works for your lifestyle and cooking habits.

Remember that the best kitchen renovation is one that improves your daily life while adding value to your home. Take time to plan carefully, choose quality materials within your budget, and don't hesitate to consult with professionals when needed.

Your dream kitchen is achievable with the right approach, patience, and planning.`,
    excerpt: "Complete guide to planning and executing a kitchen renovation on any budget, from design considerations to material selection.",
    categorySlug: "home-improvement",
    tags: ["kitchen renovation", "home improvement", "design", "budgeting", "DIY"],
    featured: true,
    author: "Mike Rodriguez",
    status: "published"
  },
  {
    title: "Auto Insurance Essentials: Coverage Types, Costs, and Savings Tips",
    description: "Everything you need to know about auto insurance: required coverage types, optional add-ons, factors affecting rates, and practical tips to save money.",
    content: `# Auto Insurance Essentials: Coverage Types, Costs, and Savings Tips

Auto insurance is not just a legal requirement in most states—it's essential financial protection that can save you from devastating costs in the event of an accident. Understanding the different types of coverage, factors that affect your rates, and strategies to save money will help you make informed decisions about your auto insurance policy.

## Understanding Auto Insurance Basics

### What Auto Insurance Covers

Auto insurance provides financial protection against:
- **Physical damage** to your vehicle
- **Liability** for injuries or property damage you cause to others
- **Medical expenses** from injuries sustained in accidents
- **Legal costs** if you're sued after an accident
- **Theft or vandalism** of your vehicle

## Types of Auto Insurance Coverage

### Required Coverage (varies by state)

#### Liability Coverage
**Bodily Injury Liability**: Pays for injuries you cause to others
- Medical expenses
- Lost wages
- Pain and suffering
- Legal defense costs

**Property Damage Liability**: Pays for property damage you cause
- Vehicle repairs or replacement
- Buildings, fences, or other property
- Rental car expenses for the other party

#### Personal Injury Protection (PIP) / Medical Payments
- Covers medical expenses for you and your passengers
- May include lost wages and essential services
- Required in some "no-fault" states

### Optional Coverage

#### Comprehensive Coverage
Protects against non-collision damage:
- Theft or vandalism
- Weather damage (hail, flood, wind)
- Fire damage
- Falling objects
- Animal collisions

#### Collision Coverage
- Pays for damage to your car from collisions
- Covers accidents with other vehicles or objects
- Includes single-car accidents and rollovers

#### Uninsured/Underinsured Motorist Coverage
- Protects when the at-fault driver has no insurance or insufficient coverage
- Covers bodily injury and sometimes property damage
- Hit-and-run protection

#### Rental Car Coverage
- Pays for temporary rental car while your vehicle is being repaired
- Typically covers $30-50 per day for specific time period

#### Gap Insurance
- Covers difference between your car's value and what you owe on loan/lease
- Important for new cars that depreciate quickly
- Usually available through dealer or insurer

## Factors Affecting Auto Insurance Rates

### Driver-Related Factors

#### Age and Experience
- Teen drivers: Highest rates due to inexperience
- Young adults (20-25): High rates, gradually decreasing
- Middle-aged drivers (25-65): Lowest rates
- Senior drivers (65+): Rates may increase slightly

#### Driving Record
- **Clean record**: Best rates
- **Minor violations**: Small increase (5-15%)
- **Major violations**: Significant increase (20-50%)
- **DUI/DWI**: Dramatic increase (80-100% or more)
- **At-fault accidents**: Substantial rate increases

#### Credit Score
- Most states allow credit-based insurance scoring
- Better credit generally means lower rates
- Poor credit can double your premiums in some cases

### Vehicle-Related Factors

#### Vehicle Type
- **Luxury/Sports cars**: Higher rates due to expensive repairs
- **Family sedans/SUVs**: Moderate rates
- **Economy cars**: Generally lower rates
- **Safety features**: Discounts for anti-theft systems, safety equipment

#### Vehicle Age
- **New cars**: Higher comprehensive/collision coverage costs
- **Older cars**: May not need full coverage
- **Classic cars**: May need specialized coverage

### Location Factors

#### Where You Live
- **Urban areas**: Higher rates due to traffic, crime, accidents
- **Rural areas**: Generally lower rates
- **State requirements**: Affect minimum coverage needs

#### Where You Park
- **Garage**: Lower rates
- **Driveway**: Moderate rates
- **Street parking**: Higher rates

## State Minimum Requirements

### No-Fault States
Require Personal Injury Protection (PIP):
- Florida, Hawaii, Kansas, Kentucky, Massachusetts, Michigan, Minnesota, New York, North Dakota, Pennsylvania, Utah

### Tort States
Traditional liability-based system:
- All other states

### Minimum Liability Limits (examples)
- **California**: 15/30/5 ($15k bodily injury per person, $30k per accident, $5k property damage)
- **Texas**: 30/60/25
- **New York**: 25/50/10
- **Florida**: 10/20/10 (PIP state)

*Note: State minimums are often inadequate for serious accidents*

## Recommended Coverage Levels

### Liability Coverage
**Minimum Recommended**: 100/300/100
- $100,000 bodily injury per person
- $300,000 bodily injury per accident
- $100,000 property damage

**Better Protection**: 250/500/100 or higher

### Comprehensive and Collision
**New/financed cars**: Required by lender
**Older cars**: Consider dropping if annual premium exceeds 10% of car's value

### Uninsured Motorist
**Recommended**: Match your liability limits
**High uninsured rates**: Essential in states with high uninsured driver rates

## Money-Saving Strategies

### Shop Around Regularly
- Compare quotes from multiple insurers annually
- Rates can vary significantly between companies
- Consider both traditional and online insurers
- Use independent agents to compare multiple options

### Take Advantage of Discounts

#### Safe Driver Discounts
- Good driver (no accidents/violations)
- Defensive driving course completion
- Usage-based insurance programs (telematics)

#### Vehicle Discounts
- Anti-theft devices
- Safety features (airbags, ABS, electronic stability control)
- Anti-lock brakes
- Daytime running lights

#### Policy Discounts
- Multi-policy (bundling home and auto)
- Multi-vehicle
- Paperless billing
- Pay-in-full
- Automatic payment

#### Personal Discounts
- Good student (for young drivers)
- Military/veterans
- Professional affiliations
- Alumni associations
- Senior citizen

### Adjust Your Coverage

#### Increase Deductibles
- Higher deductible = lower premiums
- Common deductibles: $250, $500, $1,000
- Ensure you can afford the deductible amount

#### Drop Unnecessary Coverage
- Remove coverage on very old vehicles
- Evaluate rental car coverage if you have alternatives
- Consider gap insurance needs

#### Reduce Coverage on Older Vehicles
- Consider liability-only coverage
- Weigh annual premium against vehicle value

### Improve Your Profile

#### Maintain Good Credit
- Pay bills on time
- Keep credit utilization low
- Monitor credit reports for errors
- Build credit history gradually

#### Drive Safely
- Avoid tickets and accidents
- Take defensive driving courses
- Consider usage-based insurance if you're a safe driver

#### Choose Vehicles Wisely
- Research insurance costs before buying
- Consider safety ratings and theft rates
- Avoid high-performance vehicles if cost is a concern

## Common Auto Insurance Mistakes

### Coverage Mistakes
1. **Buying minimum coverage only**: Inadequate protection
2. **Skipping uninsured motorist coverage**: Risky in high uninsured areas
3. **Not updating coverage**: Failing to adjust as vehicle ages
4. **Ignoring rental coverage**: Unexpected expenses during repairs

### Shopping Mistakes
1. **Not shopping around**: Missing potential savings
2. **Choosing based on price alone**: Ignoring service quality
3. **Not reading the policy**: Misunderstanding coverage
4. **Buying unnecessary add-ons**: Wasting money on unused coverage

### Claims Mistakes
1. **Not reporting accidents promptly**: Delayed claims processing
2. **Admitting fault at scene**: Leave fault determination to insurers
3. **Not documenting damage**: Poor evidence for claims
4. **Settling too quickly**: Accepting inadequate settlements

## Filing Claims: Best Practices

### After an Accident
1. **Ensure safety**: Move to safe location if possible
2. **Call police**: Get official accident report
3. **Document everything**: Photos, witness information, damage
4. **Exchange information**: Insurance, contact, vehicle details
5. **Contact your insurer**: Report within 24 hours

### Working with Adjusters
- Be honest and factual
- Provide requested documentation promptly
- Keep detailed records of all communications
- Don't accept first settlement offer without consideration
- Consider independent appraisal for disputes

## Special Considerations

### Teen Drivers
- Add to existing policy vs. separate policy
- Good student discounts
- Driver training course credits
- Consider usage-based insurance
- Set clear driving rules and consequences

### Senior Drivers
- Mature driver discounts
- Defensive driving course discounts
- Regular driving assessments
- Consider reducing coverage as driving decreases

### High-Risk Drivers
- SR-22 certificate requirements
- Non-standard insurance markets
- Higher deductibles to lower premiums
- Focus on improving driving record

## Technology and Auto Insurance

### Usage-Based Insurance (UBI)
**How it works**: Monitor driving habits via smartphone app or device
**Factors measured**: 
- Mileage
- Time of day driving
- Hard braking/acceleration
- Phone usage while driving

**Potential savings**: 10-30% for safe drivers
**Privacy considerations**: Data collection and usage

### Digital Tools
- Mobile apps for claims reporting
- Online policy management
- Digital ID cards
- Roadside assistance apps

## Future of Auto Insurance

### Autonomous Vehicles
- Shift from driver liability to product liability
- Reduced accident rates may lower premiums
- New coverage types for technology failures

### Electric Vehicles
- Different repair costs and procedures
- Specialized coverage needs
- Environmental considerations

## Conclusion

Auto insurance is a crucial financial protection that requires careful consideration of your needs, budget, and risk tolerance. By understanding coverage types, factors affecting rates, and money-saving strategies, you can make informed decisions that provide adequate protection at a reasonable cost.

Remember to review your coverage annually, shop around for competitive rates, and maintain good driving habits to keep your premiums low. The key is finding the right balance between adequate protection and affordable premiums for your specific situation.

Stay informed about changes in insurance regulations, new discount opportunities, and evolving coverage options to ensure you're getting the best value from your auto insurance investment.`,
    excerpt: "Comprehensive guide to auto insurance covering required and optional coverage types, cost factors, and money-saving strategies.",
    categorySlug: "auto-insurance",
    tags: ["auto insurance", "car insurance", "liability coverage", "coverage types", "insurance savings"],
    featured: false,
    author: "Jennifer Martinez",
    status: "published"
  }
];

async function createPosts() {
  try {
    console.log('Starting to create sample posts...');
    
    // Get all categories first to map slugs to IDs
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = {};
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categories[data.slug] = doc.id;
    });

    console.log('Available categories:', Object.keys(categories));

    // Create posts
    for (const postData of samplePosts) {
      const categoryId = categories[postData.categorySlug];
      
      if (!categoryId) {
        console.log(`Category not found for slug: ${postData.categorySlug}. Skipping post: ${postData.title}`);
        continue;
      }

      // Generate slug from title
      const slug = postData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if post already exists
      const existingPost = await db.collection('posts')
        .where('slug', '==', slug)
        .get();

      if (!existingPost.empty) {
        console.log(`Post already exists: ${postData.title}`);
        continue;
      }

      const post = {
        title: postData.title,
        description: postData.description,
        content: postData.content,
        excerpt: postData.excerpt,
        slug: slug,
        categoryId: categoryId,
        tags: postData.tags || [],
        featured: postData.featured || false,
        featuredImage: null,
        seo: {
          metaTitle: postData.title,
          metaDescription: postData.description,
          keywords: postData.tags || []
        },
        status: postData.status || 'published',
        scheduledFor: null,
        author: postData.author || 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-script',
        views: Math.floor(Math.random() * 1000) + 100, // Random views
        readingTime: Math.ceil(postData.content.length / 1000) // Rough estimate
      };

      const docRef = await db.collection('posts').add(post);
      console.log(`Created post: ${postData.title} (ID: ${docRef.id})`);
    }

    console.log('Sample posts creation completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating posts:', error);
    process.exit(1);
  }
}

createPosts();