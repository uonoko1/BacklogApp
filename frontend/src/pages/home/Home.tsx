import React from 'react'
import "./Home.css"
import Topbar from '../../components/topbar/Topbar'
import Sidebar from '../../components/sidebar/Sidebar'
import Center from '../../components/center/Center'

export default function Home() {
	return (
		<div className='Home'>
			<Topbar />
			<div className="bottom">
				<Sidebar />
				<Center />
			</div>
		</div>
	)
}
