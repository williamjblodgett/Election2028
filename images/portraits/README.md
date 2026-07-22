# Candidate Portrait Art

The modern 2028 field uses original AI-generated editorial illustrations.
They are stylized game art—not photographs, official portraits, campaign
materials, or endorsements by the people depicted.

## Art direction

- Hand-painted 2D editorial realism
- Recognizable facial structure and signature hairstyle
- Head-and-shoulders framing at a consistent scale
- Professional campaign attire
- Deep navy studio background with cool broadcast rim light
- Neutral, confident expressions without partisan visual treatment

Visual references were researched from official government portraits, press
kits, and public appearances. The generated artwork does not reproduce or
redistribute those source photographs.

## Production format

- Filename: canonical candidate id, such as `newsom.jpg`
- Dimensions: 512×512 pixels
- Format: optimized JPEG
- UI behavior: rectangular cards use a cover crop; debates, cabinet screens,
  and election-night graphics use circular masks from the same source

The portrait loader automatically falls back to a candidate’s emoji when an
asset is absent. Running-mate records use `candidateId` to reuse the canonical
portrait instead of storing duplicate art.

## Generated modern field

The folder contains 32 portraits: 16 Democratic and 16 Republican modern
presidential contenders. Historical legends retain the existing optional
public-domain portrait pipeline.

## Broadcast artwork

Companion studio plates live in `images/broadcast/`:

- `debate-stage.jpg`
- `election-night-studio.jpg`
- `special-report-studio.jpg`

These are original fictional GNN environments. No real broadcaster’s logo,
set, or trademark is included. All headlines, candidate names, results, and
lower-thirds remain live HTML so the art stays reusable and accessible.
