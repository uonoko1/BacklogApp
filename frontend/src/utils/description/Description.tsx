import React from 'react';
import './Description.css'

interface DescriptionProps {
    description: string;
}

const Description = ({ description }: DescriptionProps) => {
    const lines = description.split('\n');
    let inList = false;
    let inP = false;
    let currentItem: any = [];
    const content: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];
    let pItems: JSX.Element[] = [];

    lines.forEach((line, index) => {
        if (line.startsWith('- ')) {
            if (!inList) {
                inList = true;
                listItems = [];
            }
            if (currentItem.length > 0) {
                listItems.push(<li key={`li-${index - 1}`}>{currentItem}</li>);
                currentItem = [];
            }
            currentItem.push(<span key={`span-${index}`}>{line.substring(2)}</span>);
        } else if (inList) {
            if (line.trim() === '') {
                inList = false;
                listItems.push(<li key={`li-${index - 1}`}>{currentItem}</li>);
                content.push(<ul key={`ul-${index}`}>{listItems}</ul>);
                currentItem = [];
            } else {
                currentItem.push(<br key={`br-${index}`} />, <span key={`line-${index}`}>{line}</span>);
            }
        } else if (inP) {
            if (line.trim() === '') {
                inP = false;
                content.push(<p key={`p-${index}`}>{pItems}</p>);
                currentItem = [];
            } else {
                pItems.push(<br key={`br-${index}`} />)
                pItems.push(<span key={`span-${index}`}>{line}</span>);
            }
        } else if (line.startsWith('# ')) {
            content.push(<h1 key={`h1-${index}`}>{line.substring(2)}</h1>);
        } else if (line.startsWith('## ')) {
            content.push(<h2 key={`h2-${index}`}>{line.substring(3)}</h2>);
        } else if (line.startsWith('### ')) {
            content.push(<h3 key={`h3-${index}`}>{line.substring(4)}</h3>);
        } else {
            if (!inP) {
                inP = true;
                pItems = [];
            }
            pItems.push(<span key={`span-${index}`}>{line}</span>);
        }
    }
    );

    if (inList && currentItem.length > 0) {
        listItems.push(<li key={`li-last`}>{currentItem}</li>);
        content.push(<ul key={`ul-last`}>{listItems}</ul>);
    }

    return <div className='Description'>{content}</div>;
};

export default Description;