package no.hvl.dat152.tasklist.model;
import java.util.List;

import no.hvl.dat152.tasklist.enums.TaskStatuses;


public class ResponseGetAllstatuses extends ServerResponse {
	private List<TaskStatuses> allstatuses;

	public List<TaskStatuses> getAllstatuses() {
		return allstatuses;
	}

	public void setAllstatuses(List<TaskStatuses> allstatuses) {
		this.allstatuses = allstatuses;
	}

}
