from setuptools import setup, find_packages

setup(
    name='recentevents',
    version='0.dev',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Werkzeug',
        'redfox',
        'setuptools'
    ],
    entry_points={
        'paste.app_factory' : [
            'recentevents=recentevents.app:EventsFeed'
        ]
    }
)