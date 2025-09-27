from setuptools import setup, find_packages

setup(
    name="brand_influencer_matcher",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'openai>=1.0.0',
        'python-dotenv>=0.19.0',
        'yt-dlp>=2021.12.17',
    ],
)
