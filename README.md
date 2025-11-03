# Wheel of Life Visualization

An interactive React web application that generates a customizable Wheel of Life visualization. This tool allows you to visualize different life or work areas with custom ratings, displayed as a beautiful circular chart.

## Features

- **Real-time Visualization**: See your wheel update instantly as you change values
- **Customizable Items**: Add, remove, or edit any number of life/work areas
- **Adjustable Ratings**: Set ratings for each item (0-10 by default)
- **Color-coded Display**: 
  - Red for ratings < 5 (needs improvement)
  - Yellow for rating = 5 (moderate)
  - Green for ratings > 5 (strong performance)
- **Visual Representation**: Rating shown by number of filled bars (not color intensity)
- **Gradient Effect**: Inner bars are darker, outer bars are lighter
- **Readable Labels**: Text aligned with segment centers, non-truncated and horizontal
- **Fullscreen Mode**: View your wheel in fullscreen for better visibility
- **Responsive Design**: Works on desktop and mobile devices

## Default Configuration

The app comes pre-configured with security/IT domains:
- Data Loss Prevention (6)
- Vulnerability Management (6)
- Governance Risk Verification (5)
- Architecture (4)
- Penetration Test (5)
- Project Management (6)
- Incident Response (6)
- Engineering (4)
- DevSecOps (5)
- Training (4)
- Security Operation Center (5)

## Installation

```bash
npm install
```

## Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Usage

1. **View the Default Wheel**: The app loads with default IT security domains
2. **Show Customization Panel**: Click "Show Customization" to modify settings
3. **Edit Items**: Change the name of any category in the text field
4. **Adjust Ratings**: Use the number input to set ratings (0-10)
5. **Add Items**: Click "Add Item" to create new categories
6. **Remove Items**: Click "Remove" next to any item to delete it
7. **Change Max Score**: Adjust the maximum possible score (1-20)
8. **Reset**: Click "Reset to Defaults" to return to original settings
9. **Fullscreen**: Click "Fullscreen" to view the wheel in fullscreen mode

## Customization Options

- **Max Score**: Change the maximum rating scale (affects number of rings)
- **Item Names**: Fully customizable category names
- **Ratings**: Adjust individual ratings for each category
- **Dynamic Items**: Add or remove categories as needed

## Technology Stack

- React 18
- Vite (build tool)
- SVG for visualization
- Pure CSS styling

## License

MIT
