const { Status } = require('./models');

const seedStatuses = async () => {
    const initialStatuses = [
        { name: 'pending', label: 'Pending', color: '#ff9800', is_system: true },
        { name: 'in_progress', label: 'In Progress', color: '#03a9f4', is_system: true },
        { name: 'completed', label: 'Completed', color: '#4caf50', is_system: true },
        { name: 'on_hold', label: 'On Hold', color: '#9e9e9e', is_system: true },
    ];

    for (const s of initialStatuses) {
        await Status.findOrCreate({
            where: { name: s.name },
            defaults: s
        });
    }
    console.log('Statuses seeded successfully');
};

module.exports = seedStatuses;
